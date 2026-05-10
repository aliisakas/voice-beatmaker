const { createAssistantClient } = require('@salutejs/scenario');
const { scenario } = require('./scenario');

module.exports = (req, res) => {
    const assistant = createAssistantClient({
        scenario,
        storage: new (require('@salutejs/storage-adapter-memory').MemoryStorage)(),
    });
    return assistant.handleRequest(req, res);
};