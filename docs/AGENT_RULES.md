# 🤖 Agent Development Guide

## Overview

This guide covers how to create, test, and publish custom AI agents for the AgentFlow platform. Agents are the building blocks that perform specific tasks within workflows, from simple data processing to complex AI-powered operations.

## Table of Contents

1. [Agent Fundamentals](#agent-fundamentals)
2. [Development Environment](#development-environment)
3. [Creating Your First Agent](#creating-your-first-agent)
4. [Agent Architecture](#agent-architecture)
5. [Testing & Debugging](#testing--debugging)
6. [Publishing to Marketplace](#publishing-to-marketplace)
7. [Best Practices](#best-practices)
8. [Examples](#examples)

## Agent Fundamentals

### What is an Agent?

An agent is a self-contained, reusable component that:
- Accepts structured input data
- Performs a specific task or computation
- Returns structured output data
- Can be configured through parameters
- Runs in isolated execution environments

### Agent Types

**Input Agents**: Collect data from external sources
- File uploads, API calls, user forms
- Database queries, webhooks

**Processing Agents**: Transform and manipulate data
- Data validation, formatting, filtering
- Mathematical computations, text processing

**AI Agents**: Leverage artificial intelligence
- LLM interactions (GPT, Claude, Llama)
- Computer vision, speech recognition
- Machine learning model inference

**Output Agents**: Send data to external destinations
- Email, SMS, push notifications
- API calls, database updates, file generation

**Control Flow Agents**: Manage workflow execution
- Conditional branching, loops, delays
- Error handling, retry logic

## Development Environment

### Prerequisites

```bash
# Install AgentFlow CLI
npm install -g @agentflow/cli

# Install Python agent SDK
pip install agentflow-agent-sdk

# Login to your account
agentflow auth login
```

### Project Structure

```
my-agent/
├── agent.yaml          # Agent metadata and configuration
├── src/
│   ├── __init__.py
│   ├── main.py        # Main agent implementation
│   └── utils.py       # Helper functions
├── tests/
│   ├── test_main.py   # Unit tests
│   └── fixtures/      # Test data
├── docs/
│   ├── README.md      # Agent documentation
│   └── examples/      # Usage examples
├── requirements.txt    # Python dependencies
└── .agentignore       # Files to exclude from packaging
```

### Initialize New Agent

```bash
# Create new agent project
agentflow agents create my-custom-agent

# Navigate to project
cd my-custom-agent

# Install dependencies
pip install -r requirements.txt
```

## Creating Your First Agent

### 1. Define Agent Metadata

Create `agent.yaml`:

```yaml
name: "Text Sentiment Analyzer"
description: "Analyze sentiment of text using AI models"
version: "1.0.0"
category: "ai"
tags: ["nlp", "sentiment", "analysis"]

author:
  name: "Your Name"
  email: "your.email@example.com"
  organization: "Your Company"

runtime:
  python_version: "3.11"
  timeout: 30
  memory_limit: "512Mi"
  cpu_limit: "500m"

dependencies:
  - "transformers>=4.20.0"
  - "torch>=2.0.0"
  - "numpy>=1.24.0"

configuration:
  schema:
    type: object
    properties:
      model_name:
        type: string
        default: "cardiffnlp/twitter-roberta-base-sentiment-latest"
        description: "HuggingFace model for sentiment analysis"
      confidence_threshold:
        type: number
        minimum: 0.0
        maximum: 1.0
        default: 0.7
        description: "Minimum confidence score for predictions"
    required: ["model_name"]

input:
  schema:
    type: object
    properties:
      text:
        type: string
        description: "Text to analyze for sentiment"
        maxLength: 10000
    required: ["text"]

output:
  schema:
    type: object
    properties:
      sentiment:
        type: string
        enum: ["positive", "negative", "neutral"]
        description: "Detected sentiment"
      confidence:
        type: number
        minimum: 0.0
        maximum: 1.0
        description: "Confidence score"
      details:
        type: object
        properties:
          positive_score: { type: number }
          negative_score: { type: number }
          neutral_score: { type: number }
```

### 2. Implement Agent Logic

Create `src/main.py`:

```python
from agentflow import Agent, AgentContext, AgentError
from transformers import pipeline
import torch
from typing import Dict, Any


class SentimentAnalyzer(Agent):
    """
    Sentiment analysis agent using HuggingFace transformers.
    """
    
    def __init__(self):
        super().__init__()
        self.classifier = None
    
    def initialize(self, context: AgentContext) -> None:
        """
        Initialize the agent with configuration.
        Called once when the agent starts.
        """
        try:
            model_name = context.config.get("model_name")
            self.logger.info(f"Loading model: {model_name}")
            
            # Initialize the sentiment analysis pipeline
            self.classifier = pipeline(
                "sentiment-analysis",
                model=model_name,
                torch_dtype=torch.float16 if torch.cuda.is_available() else torch.float32
            )
            
            self.logger.info("Model loaded successfully")
            
        except Exception as e:
            raise AgentError(f"Failed to initialize model: {str(e)}")
    
    def execute(self, inputs: Dict[str, Any], context: AgentContext) -> Dict[str, Any]:
        """
        Execute sentiment analysis on input text.
        
        Args:
            inputs: Dictionary containing 'text' key
            context: Agent execution context
            
        Returns:
            Dictionary containing sentiment analysis results
        """
        try:
            text = inputs["text"]
            confidence_threshold = context.config.get("confidence_threshold", 0.7)
            
            self.logger.info(f"Analyzing sentiment for text: {text[:100]}...")
            
            # Perform sentiment analysis
            results = self.classifier(text)
            
            # Extract results
            result = results[0]
            label = result["label"].lower()
            score = result["score"]
            
            # Map model labels to standard sentiment labels
            sentiment_mapping = {
                "label_2": "positive",
                "label_1": "neutral", 
                "label_0": "negative",
                "positive": "positive",
                "negative": "negative",
                "neutral": "neutral"
            }
            
            sentiment = sentiment_mapping.get(label, "neutral")
            
            # Get detailed scores if available
            detailed_results = self.classifier(text, return_all_scores=True)
            details = {}
            
            if detailed_results and len(detailed_results[0]) > 1:
                for item in detailed_results[0]:
                    score_label = sentiment_mapping.get(item["label"].lower(), item["label"].lower())
                    details[f"{score_label}_score"] = item["score"]
            else:
                details[f"{sentiment}_score"] = score
            
            # Check confidence threshold
            if score < confidence_threshold:
                self.logger.warning(f"Low confidence score: {score:.3f}")
            
            result = {
                "sentiment": sentiment,
                "confidence": score,
                "details": details
            }
            
            self.logger.info(f"Analysis complete: {sentiment} ({score:.3f})")
            
            return result
            
        except KeyError as e:
            raise AgentError(f"Missing required input: {str(e)}")
        except Exception as e:
            self.logger.error(f"Sentiment analysis failed: {str(e)}")
            raise AgentError(f"Analysis failed: {str(e)}")
    
    def cleanup(self, context: AgentContext) -> None:
        """
        Cleanup resources when the agent shuts down.
        """
        self.logger.info("Cleaning up sentiment analyzer")
        self.classifier = None


# Export the agent class
def create_agent() -> Agent:
    """Factory function to create agent instance."""
    return SentimentAnalyzer()
```

### 3. Add Helper Utilities

Create `src/utils.py`:

```python
import re
from typing import str


def clean_text(text: str) -> str:
    """
    Clean and preprocess text for sentiment analysis.
    
    Args:
        text: Raw input text
        
    Returns:
        Cleaned text
    """
    # Remove excessive whitespace
    text = re.sub(r'\s+', ' ', text.strip())
    
    # Remove special characters but keep emoticons
    text = re.sub(r'[^\w\s\.\!\?\:\;\-\(\)\@\#]', '', text)
    
    return text


def validate_text_length(text: str, max_length: int = 10000) -> bool:
    """
    Validate text length constraints.
    
    Args:
        text: Input text
        max_length: Maximum allowed length
        
    Returns:
        True if valid, False otherwise
    """
    return len(text) <= max_length
```

## Agent Architecture

### Base Agent Class

All agents inherit from the base `Agent` class:

```python
from agentflow import Agent, AgentContext

class MyAgent(Agent):
    def initialize(self, context: AgentContext) -> None:
        """Initialize agent with configuration"""
        pass
    
    def execute(self, inputs: Dict[str, Any], context: AgentContext) -> Dict[str, Any]:
        """Main execution logic"""
        pass
    
    def cleanup(self, context: AgentContext) -> None:
        """Cleanup resources"""
        pass
```

### Agent Context

The `AgentContext` provides access to:

```python
class AgentContext:
    config: Dict[str, Any]      # Agent configuration
    secrets: Dict[str, str]     # Secure credentials
    logger: Logger              # Structured logger
    metrics: MetricsCollector   # Performance metrics
    storage: Storage            # Temporary file storage
    http: HttpClient           # HTTP client for API calls
```

### Error Handling

Use `AgentError` for execution errors:

```python
from agentflow import AgentError

def execute(self, inputs, context):
    try:
        # Agent logic here
        pass
    except ValueError as e:
        raise AgentError(f"Invalid input: {str(e)}")
    except ConnectionError as e:
        raise AgentError(f"Network error: {str(e)}")
```

## Testing & Debugging

### Unit Tests

Create `tests/test_main.py`:

```python
import pytest
from unittest.mock import Mock, patch
from src.main import SentimentAnalyzer
from agentflow import AgentContext, AgentError


@pytest.fixture
def agent():
    return SentimentAnalyzer()


@pytest.fixture
def mock_context():
    context = Mock(spec=AgentContext)
    context.config = {
        "model_name": "cardiffnlp/twitter-roberta-base-sentiment-latest",
        "confidence_threshold": 0.7
    }
    context.logger = Mock()
    return context


def test_positive_sentiment(agent, mock_context):
    """Test positive sentiment detection"""
    with patch.object(agent, 'classifier') as mock_classifier:
        mock_classifier.return_value = [{"label": "POSITIVE", "score": 0.95}]
        
        inputs = {"text": "I love this product! It's amazing!"}
        result = agent.execute(inputs, mock_context)
        
        assert result["sentiment"] == "positive"
        assert result["confidence"] == 0.95


def test_negative_sentiment(agent, mock_context):
    """Test negative sentiment detection"""
    with patch.object(agent, 'classifier') as mock_classifier:
        mock_classifier.return_value = [{"label": "NEGATIVE", "score": 0.88}]
        
        inputs = {"text": "This is terrible! I hate it!"}
        result = agent.execute(inputs, mock_context)
        
        assert result["sentiment"] == "negative"
        assert result["confidence"] == 0.88


def test_missing_input(agent, mock_context):
    """Test error handling for missing input"""
    inputs = {}  # Missing 'text' key
    
    with pytest.raises(AgentError):
        agent.execute(inputs, mock_context)


def test_long_text_handling(agent, mock_context):
    """Test handling of long text inputs"""
    with patch.object(agent, 'classifier') as mock_classifier:
        mock_classifier.return_value = [{"label": "NEUTRAL", "score": 0.75}]
        
        long_text = "This is a test. " * 1000  # Very long text
        inputs = {"text": long_text}
        
        result = agent.execute(inputs, mock_context)
        assert result["sentiment"] == "neutral"
```

### Local Testing

```bash
# Run unit tests
pytest tests/ -v

# Test agent locally
agentflow agents test --input '{"text": "I love AgentFlow!"}'

# Debug mode
agentflow agents test --debug --input '{"text": "Test message"}'
```

### Integration Testing

```python
# tests/test_integration.py
import asyncio
from agentflow.testing import AgentTestRunner


async def test_agent_integration():
    """Test agent in simulated workflow environment"""
    runner = AgentTestRunner("sentiment-analyzer")
    
    # Test with various inputs
    test_cases = [
        {"text": "Great product!", "expected_sentiment": "positive"},
        {"text": "Terrible experience", "expected_sentiment": "negative"},
        {"text": "It's okay", "expected_sentiment": "neutral"}
    ]
    
    for case in test_cases:
        result = await runner.execute(case)
        assert result["sentiment"] == case["expected_sentiment"]


# Run integration tests
asyncio.run(test_agent_integration())
```

## Publishing to Marketplace

### 1. Prepare Documentation

Create `docs/README.md`:

```markdown
# Text Sentiment Analyzer

Analyze the sentiment of text using state-of-the-art AI models.

## Features

- Multiple model support (BERT, RoBERTa, DistilBERT)
- Confidence scoring
- Detailed sentiment breakdown
- Optimized for performance

## Usage

### Basic Example

```json
{
  "text": "I love using AgentFlow for automation!"
}
```

**Output:**
```json
{
  "sentiment": "positive",
  "confidence": 0.94,
  "details": {
    "positive_score": 0.94,
    "negative_score": 0.03,
    "neutral_score": 0.03
  }
}
```

### Configuration

- `model_name`: HuggingFace model identifier
- `confidence_threshold`: Minimum confidence for predictions

## Supported Models

- cardiffnlp/twitter-roberta-base-sentiment-latest
- nlptown/bert-base-multilingual-uncased-sentiment
- distilbert-base-uncased-finetuned-sst-2-english
```

### 2. Package Agent

```bash
# Validate agent
agentflow agents validate

# Package for publishing
agentflow agents package

# Test packaged agent
agentflow agents test-package sentiment-analyzer-1.0.0.tar.gz
```

### 3. Publish to Marketplace

```bash
# Login to marketplace
agentflow auth login

# Publish agent
agentflow agents publish

# Check publication status
agentflow agents status sentiment-analyzer
```

### 4. Marketplace Listing

Your agent will appear in the marketplace with:
- Searchable name and description
- Category and tags for discovery
- Usage statistics and ratings
- Documentation and examples
- Version history and changelog

## Best Practices

### Performance Optimization

```python
class OptimizedAgent(Agent):
    def __init__(self):
        super().__init__()
        self._cache = {}
    
    def initialize(self, context):
        # Load models and resources once
        self.model = self._load_model(context.config)
    
    def execute(self, inputs, context):
        # Cache expensive computations
        cache_key = hash(str(inputs))
        if cache_key in self._cache:
            return self._cache[cache_key]
        
        result = self._process(inputs)
        self._cache[cache_key] = result
        return result
    
    def _load_model(self, config):
        # Lazy loading, model reuse
        pass
```

### Error Handling

```python
def execute(self, inputs, context):
    try:
        # Validate inputs
        self._validate_inputs(inputs)
        
        # Process with retries
        result = self._process_with_retry(inputs, max_retries=3)
        
        # Validate outputs
        self._validate_outputs(result)
        
        return result
        
    except ValidationError as e:
        raise AgentError(f"Input validation failed: {e}")
    except TimeoutError as e:
        raise AgentError(f"Processing timeout: {e}")
    except Exception as e:
        context.logger.error("Unexpected error", exc_info=True)
        raise AgentError(f"Internal error: {e}")
```

### Security Considerations

```python
def execute(self, inputs, context):
    # Sanitize inputs
    text = self._sanitize_text(inputs["text"])
    
    # Use secrets for API keys
    api_key = context.secrets.get("OPENAI_API_KEY")
    if not api_key:
        raise AgentError("Missing required API key")
    
    # Validate file uploads
    if "file" in inputs:
        self._validate_file(inputs["file"])
```

### Resource Management

```python
def execute(self, inputs, context):
    # Monitor resource usage
    context.metrics.gauge("memory_usage", self._get_memory_usage())
    
    # Set processing timeouts
    with context.timeout(30):
        result = self._process(inputs)
    
    # Clean up temporary files
    self._cleanup_temp_files()
    
    return result
```

## Examples

### Web Scraper Agent

```python
class WebScraperAgent(Agent):
    def execute(self, inputs, context):
        url = inputs["url"]
        selector = inputs.get("css_selector", "body")
        
        response = context.http.get(url, timeout=10)
        soup = BeautifulSoup(response.text, 'html.parser')
        
        elements = soup.select(selector)
        content = [elem.get_text().strip() for elem in elements]
        
        return {
            "content": content,
            "url": url,
            "scraped_at": datetime.utcnow().isoformat()
        }
```

### Database Query Agent

```python
class DatabaseQueryAgent(Agent):
    def initialize(self, context):
        self.db_url = context.secrets["DATABASE_URL"]
        self.engine = create_engine(self.db_url)
    
    def execute(self, inputs, context):
        query = inputs["sql"]
        params = inputs.get("parameters", {})
        
        # Validate query for safety
        if not self._is_safe_query(query):
            raise AgentError("Unsafe SQL query detected")
        
        with self.engine.connect() as conn:
            result = conn.execute(text(query), params)
            rows = [dict(row) for row in result]
        
        return {"rows": rows, "count": len(rows)}
```

### Email Sender Agent

```python
class EmailSenderAgent(Agent):
    def execute(self, inputs, context):
        smtp_host = context.secrets["SMTP_HOST"]
        smtp_user = context.secrets["SMTP_USER"]
        smtp_pass = context.secrets["SMTP_PASSWORD"]
        
        msg = MIMEMultipart()
        msg["From"] = inputs["from_email"]
        msg["To"] = inputs["to_email"]
        msg["Subject"] = inputs["subject"]
        
        msg.attach(MIMEText(inputs["body"], "html"))
        
        with smtplib.SMTP(smtp_host, 587) as server:
            server.starttls()
            server.login(smtp_user, smtp_pass)
            server.send_message(msg)
        
        return {"status": "sent", "message_id": str(uuid.uuid4())}
```

## Advanced Features

### Streaming Outputs

```python
def execute(self, inputs, context):
    # For long-running operations
    for i, chunk in enumerate(self._process_stream(inputs)):
        # Send intermediate results
        context.stream_output({
            "chunk": i,
            "data": chunk,
            "progress": (i + 1) / total_chunks
        })
    
    return {"status": "completed", "total_chunks": total_chunks}
```

### Multi-step Processing

```python
def execute(self, inputs, context):
    # Step 1: Data preprocessing
    context.logger.info("Step 1: Preprocessing")
    preprocessed = self._preprocess(inputs)
    
    # Step 2: Model inference
    context.logger.info("Step 2: Running inference")
    predictions = self._predict(preprocessed)
    
    # Step 3: Post-processing
    context.logger.info("Step 3: Post-processing")
    results = self._postprocess(predictions)
    
    return results
```

### Custom Metrics

```python
def execute(self, inputs, context):
    start_time = time.time()
    
    try:
        result = self._process(inputs)
        
        # Record success metrics
        context.metrics.counter("executions_success").inc()
        context.metrics.histogram("processing_time").observe(time.time() - start_time)
        
        return result
        
    except Exception as e:
        # Record failure metrics
        context.metrics.counter("executions_failed").inc()
        raise
```

## Support & Community

### Getting Help

- **Documentation**: https://docs.agentflow.dev/agents
- **Community Forum**: https://community.agentflow.dev
- **Discord**: https://discord.gg/agentflow
- **GitHub Issues**: https://github.com/agentflow/agents

### Contributing

1. Fork the agent template repository
2. Create your agent following this guide
3. Submit a pull request with your agent
4. Participate in code review process
5. Publish to the marketplace

### Agent Marketplace Guidelines

- **Quality**: Well-tested, documented, and reliable
- **Originality**: Unique functionality or significant improvements
- **Security**: Secure coding practices, no vulnerabilities
- **Performance**: Optimized for production use
- **Compliance**: Follows marketplace terms and conditions