#!/bin/bash
set -e

# AgentFlow Development Environment Setup Script
# This script sets up the complete AgentFlow development environment

echo "🚀 Setting up AgentFlow Development Environment"
echo "=============================================="

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check prerequisites
check_prerequisites() {
    print_status "Checking prerequisites..."
    
    local missing_deps=()
    
    if ! command_exists node; then
        missing_deps+=("Node.js 18+")
    else
        NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
        if [ "$NODE_VERSION" -lt 18 ]; then
            missing_deps+=("Node.js 18+ (current: $(node --version))")
        fi
    fi
    
    if ! command_exists npm; then
        missing_deps+=("npm")
    fi
    
    if ! command_exists python3; then
        missing_deps+=("Python 3.11+")
    else
        PYTHON_VERSION=$(python3 --version | cut -d' ' -f2 | cut -d'.' -f1-2)
        if ! python3 -c "import sys; exit(0 if sys.version_info >= (3, 11) else 1)"; then
            missing_deps+=("Python 3.11+ (current: $PYTHON_VERSION)")
        fi
    fi
    
    if ! command_exists docker; then
        missing_deps+=("Docker")
    fi
    
    if ! command_exists docker-compose; then
        missing_deps+=("Docker Compose")
    fi
    
    if [ ${#missing_deps[@]} -gt 0 ]; then
        print_error "Missing prerequisites:"
        for dep in "${missing_deps[@]}"; do
            echo "  - $dep"
        done
        echo ""
        echo "Please install the missing prerequisites and run this script again."
        exit 1
    fi
    
    print_success "All prerequisites met!"
}

# Setup environment file
setup_environment() {
    print_status "Setting up environment configuration..."
    
    if [ ! -f .env ]; then
        if [ -f .env.example ]; then
            cp .env.example .env
            print_success "Created .env from .env.example"
        else
            print_error ".env.example not found!"
            exit 1
        fi
    else
        print_warning ".env already exists, skipping..."
    fi
    
    # Generate random secrets if they don't exist
    if grep -q "your-super-secret-key" .env; then
        print_status "Generating secure random secrets..."
        
        # Generate API secret key
        API_SECRET=$(openssl rand -hex 32)
        sed -i.bak "s/your-super-secret-key-change-this-in-production/$API_SECRET/" .env
        
        # Generate JWT secret key
        JWT_SECRET=$(openssl rand -hex 32)
        sed -i.bak "s/your-jwt-secret-key/$JWT_SECRET/" .env
        
        # Clean up backup file
        rm -f .env.bak
        
        print_success "Generated secure random secrets"
    fi
    
    print_warning "Please review and update .env file with your specific configuration:"
    print_warning "  - Add your OpenAI API key (OPENAI_API_KEY)"
    print_warning "  - Add your Anthropic API key (ANTHROPIC_API_KEY) if needed"
    print_warning "  - Configure storage settings if using S3"
}

# Install frontend dependencies
install_frontend_deps() {
    print_status "Installing frontend dependencies..."
    
    cd frontend
    
    if [ ! -f package.json ]; then
        print_error "package.json not found in frontend directory!"
        exit 1
    fi
    
    npm install
    print_success "Frontend dependencies installed"
    
    cd ..
}

# Install backend dependencies
install_backend_deps() {
    print_status "Installing backend dependencies..."
    
    cd backend
    
    if [ ! -f requirements.txt ]; then
        print_error "requirements.txt not found in backend directory!"
        exit 1
    fi
    
    # Create virtual environment if it doesn't exist
    if [ ! -d venv ]; then
        print_status "Creating Python virtual environment..."
        python3 -m venv venv
    fi
    
    # Activate virtual environment
    source venv/bin/activate
    
    # Upgrade pip
    pip install --upgrade pip
    
    # Install dependencies
    pip install -r requirements.txt
    
    print_success "Backend dependencies installed"
    
    cd ..
}

# Start services with Docker Compose
start_services() {
    print_status "Starting supporting services with Docker Compose..."
    
    if [ ! -f docker-compose.yml ]; then
        print_error "docker-compose.yml not found!"
        exit 1
    fi
    
    # Pull latest images
    docker-compose pull
    
    # Start services in detached mode
    docker-compose up -d postgres redis prometheus grafana
    
    # Wait for services to be ready
    print_status "Waiting for services to be ready..."
    sleep 10
    
    # Check if PostgreSQL is ready
    for i in {1..30}; do
        if docker-compose exec -T postgres pg_isready -U agentflow > /dev/null 2>&1; then
            break
        fi
        if [ $i -eq 30 ]; then
            print_error "PostgreSQL failed to start"
            exit 1
        fi
        sleep 2
    done
    
    # Check if Redis is ready
    for i in {1..30}; do
        if docker-compose exec -T redis redis-cli ping > /dev/null 2>&1; then
            break
        fi
        if [ $i -eq 30 ]; then
            print_error "Redis failed to start"
            exit 1
        fi
        sleep 2
    done
    
    print_success "Services are ready!"
}

# Run database migrations
setup_database() {
    print_status "Setting up database..."
    
    cd backend
    source venv/bin/activate
    
    # Check if Alembic is configured
    if [ ! -f alembic.ini ]; then
        print_status "Initializing Alembic..."
        alembic init migrations
        
        # Update alembic.ini to use environment variable
        sed -i.bak 's|sqlalchemy.url = driver://user:pass@localhost/dbname|sqlalchemy.url = |' alembic.ini
        rm -f alembic.ini.bak
    fi
    
    # Run migrations
    if ls migrations/versions/*.py 1> /dev/null 2>&1; then
        print_status "Running database migrations..."
        alembic upgrade head
        print_success "Database migrations completed"
    else
        print_status "Creating initial migration..."
        alembic revision --autogenerate -m "Initial migration"
        alembic upgrade head
        print_success "Initial database setup completed"
    fi
    
    cd ..
}

# Verify installation
verify_installation() {
    print_status "Verifying installation..."
    
    # Check if backend can start
    print_status "Testing backend startup..."
    cd backend
    source venv/bin/activate
    timeout 10s python -c "from main import app; print('Backend imports successfully')" || {
        print_error "Backend has import errors"
        cd ..
        exit 1
    }
    cd ..
    
    # Check if frontend builds
    print_status "Testing frontend build..."
    cd frontend
    timeout 30s npm run build > /dev/null || {
        print_error "Frontend build failed"
        cd ..
        exit 1
    }
    cd ..
    
    print_success "Installation verification completed!"
}

# Create helper scripts
create_helper_scripts() {
    print_status "Creating helper scripts..."
    
    # Development start script
    cat > start-dev.sh << 'EOF'
#!/bin/bash
# Start AgentFlow development environment

echo "Starting AgentFlow Development Environment..."

# Start Docker services
docker-compose up -d postgres redis

# Start backend in background
echo "Starting backend..."
cd backend
source venv/bin/activate
python main.py &
BACKEND_PID=$!
cd ..

# Start frontend in background
echo "Starting frontend..."
cd frontend
npm run dev &
FRONTEND_PID=$!
cd ..

echo ""
echo "🚀 AgentFlow is starting up!"
echo ""
echo "Frontend: http://localhost:5173"
echo "Backend:  http://localhost:8000"
echo "API Docs: http://localhost:8000/docs"
echo "Grafana:  http://localhost:3001 (admin/admin)"
echo ""
echo "Press Ctrl+C to stop all services"

# Handle cleanup on exit
cleanup() {
    echo ""
    echo "Shutting down services..."
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
    docker-compose stop
    exit 0
}

trap cleanup SIGINT SIGTERM

# Wait for processes
wait $BACKEND_PID $FRONTEND_PID
EOF

    chmod +x start-dev.sh
    
    # Stop services script
    cat > stop-dev.sh << 'EOF'
#!/bin/bash
# Stop AgentFlow development environment

echo "Stopping AgentFlow Development Environment..."

# Stop Docker services
docker-compose stop

# Kill any remaining processes
pkill -f "npm run dev"
pkill -f "python main.py"
pkill -f "uvicorn"

echo "Services stopped"
EOF

    chmod +x stop-dev.sh
    
    # Reset environment script
    cat > reset-env.sh << 'EOF'
#!/bin/bash
# Reset AgentFlow development environment

echo "Resetting AgentFlow Development Environment..."

# Stop services
./stop-dev.sh

# Remove Docker volumes (database data will be lost)
read -p "This will delete all database data. Continue? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    docker-compose down -v
    echo "Environment reset complete"
else
    echo "Reset cancelled"
fi
EOF

    chmod +x reset-env.sh
    
    print_success "Helper scripts created (start-dev.sh, stop-dev.sh, reset-env.sh)"
}

# Print final instructions
print_final_instructions() {
    echo ""
    echo "🎉 AgentFlow Development Environment Setup Complete!"
    echo "=================================================="
    echo ""
    echo "Next steps:"
    echo ""
    echo "1. Review and update configuration:"
    echo "   ${YELLOW}nano .env${NC}"
    echo ""
    echo "2. Start the development environment:"
    echo "   ${GREEN}./start-dev.sh${NC}"
    echo ""
    echo "3. Access AgentFlow:"
    echo "   • Frontend: ${BLUE}http://localhost:5173${NC}"
    echo "   • Backend API: ${BLUE}http://localhost:8000${NC}"
    echo "   • API Documentation: ${BLUE}http://localhost:8000/docs${NC}"
    echo "   • Grafana Dashboard: ${BLUE}http://localhost:3001${NC} (admin/admin)"
    echo ""
    echo "4. Stop the environment when done:"
    echo "   ${YELLOW}./stop-dev.sh${NC}"
    echo ""
    echo "Helpful commands:"
    echo "   • Reset environment: ${YELLOW}./reset-env.sh${NC}"
    echo "   • View logs: ${YELLOW}docker-compose logs -f${NC}"
    echo "   • Backend shell: ${YELLOW}cd backend && source venv/bin/activate${NC}"
    echo ""
    echo "Happy coding! 🚀"
    echo ""
}

# Main execution
main() {
    echo ""
    check_prerequisites
    setup_environment
    install_frontend_deps
    install_backend_deps
    start_services
    setup_database
    verify_installation
    create_helper_scripts
    print_final_instructions
}

# Run main function
main "$@"