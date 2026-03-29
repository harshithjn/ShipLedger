CREATE TABLE users ( 
id UUID PRIMARY KEY, 
wallet_address VARCHAR(42) UNIQUE NOT NULL, 
role VARCHAR(20) NOT NULL, 
name VARCHAR(100), 
email VARCHAR(100), 
phone VARCHAR(20), 
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP 
); 

CREATE INDEX idx_wallet ON users(wallet_address);
