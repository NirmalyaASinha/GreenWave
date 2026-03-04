# Database setup with SQLAlchemy and SQLite
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from sqlalchemy.pool import StaticPool
import logging
from config import DATABASE_URL, DB_ECHO

logger = logging.getLogger(__name__)

# Create engine with StaticPool for SQLite in development
engine = create_engine(
    DATABASE_URL,
    echo=DB_ECHO,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def init_db():
    """Initialize database and create all tables"""
    try:
        Base.metadata.create_all(bind=engine)
        logger.info("✓ Database initialized successfully")
    except Exception as e:
        logger.error(f"✗ Database initialization failed: {e}")
        raise

def get_db():
    """Dependency for getting database session"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
