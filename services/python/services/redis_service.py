import redis
from typing import Any, Optional, Union
import json
from functools import wraps
import logging

logger = logging.getLogger(__name__)

class RedisService:
    def __init__(self, host: str = 'redis', port: int = 6379, db: int = 0):
        """
        Initialize Redis service with connection parameters
        
        Args:
            host (str): Redis host
            port (int): Redis port
            db (int): Redis database number
        """
        self.redis_client = redis.Redis(
            host=host,
            port=port,
            db=db,
            decode_responses=True  # Automatically decode responses to strings
        )
        
    def handle_redis_error(func):
        """Decorator to handle Redis connection errors"""
        @wraps(func)
        def wrapper(*args, **kwargs):
            try:
                return func(*args, **kwargs)
            except redis.ConnectionError as e:
                logger.error(f"Redis connection error: {str(e)}")
                raise
            except redis.RedisError as e:
                logger.error(f"Redis operation error: {str(e)}")
                raise
        return wrapper
    
    @handle_redis_error
    def set(self, key: str, value: Any, expire: Optional[int] = None) -> bool:
        """
        Set a key-value pair in Redis
        
        Args:
            key (str): Redis key
            value (Any): Value to store (will be JSON serialized)
            expire (Optional[int]): Expiration time in seconds
            
        Returns:
            bool: True if successful
        """
        serialized_value = json.dumps(value)
        return self.redis_client.set(key, serialized_value, ex=expire)
    
    @handle_redis_error
    def get(self, key: str) -> Any:
        """
        Get a value from Redis
        
        Args:
            key (str): Redis key
            
        Returns:
            Any: Deserialized value or None if key doesn't exist
        """
        value = self.redis_client.get(key)
        if value is None:
            return None
        return json.loads(value)
    
    @handle_redis_error
    def delete(self, key: str) -> bool:
        """
        Delete a key from Redis
        
        Args:
            key (str): Redis key
            
        Returns:
            bool: True if key was deleted
        """
        return bool(self.redis_client.delete(key))
    
    @handle_redis_error
    def exists(self, key: str) -> bool:
        """
        Check if a key exists in Redis
        
        Args:
            key (str): Redis key
            
        Returns:
            bool: True if key exists
        """
        return bool(self.redis_client.exists(key))
    
    @handle_redis_error
    def set_hash(self, name: str, mapping: dict) -> bool:
        """
        Set multiple hash fields to multiple values
        
        Args:
            name (str): Hash name
            mapping (dict): Dictionary of field-value pairs
            
        Returns:
            bool: True if successful
        """
        serialized_mapping = {k: json.dumps(v) for k, v in mapping.items()}
        return bool(self.redis_client.hset(name, mapping=serialized_mapping))
    
    @handle_redis_error
    def get_hash(self, name: str, field: Optional[str] = None) -> Union[dict, Any]:
        """
        Get hash field(s) value
        
        Args:
            name (str): Hash name
            field (Optional[str]): Specific field to get, if None returns all fields
            
        Returns:
            Union[dict, Any]: Dictionary of field-value pairs or single value
        """
        if field:
            value = self.redis_client.hget(name, field)
            return json.loads(value) if value else None
        
        result = self.redis_client.hgetall(name)
        return {k: json.loads(v) for k, v in result.items()}
    
    @handle_redis_error
    def delete_hash(self, name: str, *fields: str) -> int:
        """
        Delete one or more hash fields
        
        Args:
            name (str): Hash name
            *fields (str): Fields to delete
            
        Returns:
            int: Number of fields deleted
        """
        return self.redis_client.hdel(name, *fields) 