CREATE TABLE shipment_meta ( 
shipment_id VARCHAR(66) PRIMARY KEY, 
ipfs_cid TEXT NOT NULL, 
carrier_name VARCHAR(100), 
customer_email VARCHAR(100), 
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP 
); 

CREATE INDEX idx_shipment ON shipment_meta(shipment_id);
