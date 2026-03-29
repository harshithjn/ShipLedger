CREATE TABLE notifications ( 
id UUID PRIMARY KEY, 
shipment_id VARCHAR(66), 
event_type VARCHAR(50), 
sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
FOREIGN KEY (shipment_id) REFERENCES shipment_meta(shipment_id)
);
