package com.example.eventbooking.config;

import com.mongodb.client.ListIndexesIterable;
import com.mongodb.client.MongoCollection;
import com.mongodb.client.model.Indexes;
import jakarta.annotation.PostConstruct;
import org.bson.Document;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.mongodb.core.MongoTemplate;

@Configuration
public class MongoIndexConfig {

    private static final Logger log = LoggerFactory.getLogger(MongoIndexConfig.class);

    @Autowired
    private MongoTemplate mongoTemplate;

    /**
     * Ensures a 2dsphere index exists on venues.coordinates.
     * Required for MongoDB $geoNear queries used in NearbyEventService.
     * Checks for an existing 2dsphere index first to avoid IndexOptionsConflict.
     */
    @PostConstruct
    public void ensureGeoIndexes() {
        try {
            MongoCollection<Document> venues = mongoTemplate.getDb().getCollection("venues");

            // Check if a 2dsphere index already exists on 'coordinates'
            boolean indexExists = false;
            ListIndexesIterable<Document> existingIndexes = venues.listIndexes();
            for (Document idx : existingIndexes) {
                Document key = idx.get("key", Document.class);
                if (key != null && "2dsphere".equals(key.get("coordinates"))) {
                    indexExists = true;
                    break;
                }
            }

            if (indexExists) {
                log.info("✅ 2dsphere index already exists on venues.coordinates — skipping creation");
            } else {
                venues.createIndex(Indexes.geo2dsphere("coordinates"));
                log.info("✅ 2dsphere index created on venues.coordinates");
            }
        } catch (Exception e) {
            log.error("⚠️ Failed to ensure 2dsphere index on venues.coordinates: {}", e.getMessage());
        }
    }
}

