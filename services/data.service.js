// services/data.service.js
const fs = require('fs').promises;
const path = require('path');

// Path for initial data
const initialDataPath = path.join(__dirname, '..', 'public', 'data');
// Path for mutable data (Vercel uses /tmp, otherwise use initial data path)
const mutableDataPath = process.env.VERCEL ? '/tmp' : initialDataPath;

const getInitialFilePath = (fileName) => path.join(initialDataPath, `${fileName}.json`);
const getMutableFilePath = (fileName) => path.join(mutableDataPath, `${fileName}.json`);

const readFile = async (fileName) => {
    const mutableFilePath = getMutableFilePath(fileName);
    try {
        // Try reading from the mutable path first
        const data = await fs.readFile(mutableFilePath, 'utf-8');
        return data ? JSON.parse(data) : [];
    } catch (error) {
        if (error.code === 'ENOENT') {
            // If it doesn't exist in mutable storage, copy from initial data
            try {
                const initialFilePath = getInitialFilePath(fileName);
                const initialData = await fs.readFile(initialFilePath, 'utf-8');
                await fs.writeFile(mutableFilePath, initialData, 'utf-8');
                return initialData ? JSON.parse(initialData) : [];
            } catch (copyError) {
                 if (copyError.code === 'ENOENT') {
                    // If the initial file also doesn't exist, create an empty file
                    await writeFile(fileName, []);
                    return [];
                 }
                 throw copyError;
            }
        }
        throw error;
    }
};

const writeFile = async (fileName, data) => {
    const filePath = getMutableFilePath(fileName);
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
