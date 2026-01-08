// services/data.service.js
const fs = require('fs').promises;
const path = require('path');

const dataFolderPath = path.join(__dirname, '..', 'data');

const getFilePath = (fileName) => path.join(dataFolderPath, `${fileName}.json`);

const readFile = async (fileName) => {
    try {
        const filePath = getFilePath(fileName);
        const data = await fs.readFile(filePath, 'utf-8');
        return data ? JSON.parse(data) : [];
    } catch (error) {
        if (error.code === 'ENOENT') {
            // File doesn't exist, return empty array
            await writeFile(fileName, []);
            return [];
        }
        throw error;
    }
};

const writeFile = async (fileName, data) => {
    const filePath = getFilePath(fileName);
    await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
};

const find = async (fileName) => {
    return await readFile(fileName);
};

const findById = async (fileName, id) => {
    const items = await readFile(fileName);
    return items.find(item => item.id === id);
};

const findByProperty = async (fileName, property, value) => {
    const items = await readFile(fileName);
    return items.filter(item => item[property] === value);
};

const create = async (fileName, item) => {
    const items = await readFile(fileName);
    items.push(item);
    await writeFile(fileName, items);
    return item;
};

const update = async (fileName, id, updatedItem) => {
    const items = await readFile(fileName);
    const index = items.findIndex(item => item.id === id);
    if (index === -1) {
        throw new Error(`${fileName.slice(0, -1)} not found.`);
    }
    items[index] = { ...items[index], ...updatedItem };
    await writeFile(fileName, items);
    return items[index];
};

const remove = async (fileName, id) => {
    const items = await readFile(fileName);
    const filteredItems = items.filter(item => item.id !== id);
    if (items.length === filteredItems.length) {
        throw new Error(`${fileName.slice(0, -1)} not found.`);
    }
    await writeFile(fileName, filteredItems);
};

module.exports = {
    find,
    findById,
    findByProperty,
    create,
    update,
    remove,
};
