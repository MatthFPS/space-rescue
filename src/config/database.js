const mongoose = require("mongoose");

const DEFAULT_URI = "mongodb://127.0.0.1:27017/RescueDB";

// Collection-navn. Mongoose sætter det pr. model/skema, så modellen skal bruge
// konstanten: new Schema({ ... }, { collection: COLLECTION_NAME })
const COLLECTION_NAME = "SpaceRescue";

// Skjuler brugernavn/adgangskode, så forbindelsesstrengen kan logges sikkert
function maskUri(uri) {
    return uri.replace(/\/\/([^@/]+)@/, "//***@");
}

async function connectDatabase(uri = process.env.MONGODB_URI || DEFAULT_URI) {
    try {
        await mongoose.connect(uri, {
            // Fejl hurtigt (5 sek.) frem for at hænge, hvis MongoDB ikke kører
            serverSelectionTimeoutMS: 5000,
        });
    } catch (err) {
        throw new Error(
            `Kunne ikke forbinde til MongoDB på ${maskUri(uri)}: ${err.message}`,
            { cause: err }
        );
    }


    mongoose.connection.on("disconnected", () => {
        console.warn("MongoDB-forbindelsen blev afbrudt");
    });
    mongoose.connection.on("reconnected", () => {
        console.log("MongoDB-forbindelsen er genoprettet");
    });
    mongoose.connection.on("error", (err) => {
        console.error("MongoDB-fejl:", err.message);
    });

    console.log(`Forbundet til MongoDB (${mongoose.connection.name})`);
    return mongoose.connection;
}

async function disconnectDatabase() {
    await mongoose.disconnect();
}

function isDatabaseConnected() {
    return mongoose.connection.readyState === 1;
}

module.exports = { COLLECTION_NAME, connectDatabase, disconnectDatabase, isDatabaseConnected };