const fs = require('fs'),
    path = require('path')


const baseDir = path.join(__dirname, '/../.data/')

const fsOpen = (path, flags) => {
    return new Promise((resolve, reject) => {
        fs.open(path, flags, (err, fileDescriptor) => {
            !err && fileDescriptor ? resolve(fileDescriptor) : reject(err)
        })
    });
}

const fsWriteFile = (fileDescriptor, contents) => {
    return new Promise((resolve, reject) => {
        fs.writeFile(fileDescriptor, JSON.stringify(contents), err => {
            !err ? resolve(fileDescriptor) : reject(err)
        })
    });
}

const fsClose = (fileDescriptor) => {
    return new Promise((resolve, reject) => {
        fs.close(fileDescriptor, err => {
            !err ? resolve() : reject(err)
        })
    });
}

const readFile = (path) => {
    return new Promise((resolve, reject) => {
        fs.readFile(path, "utf8", (err, data) => {
            !err ? resolve(data) : reject(err)
        })
    });
}

const mainFilePath = (dir, file) => {
    return baseDir + dir + '/' + file + '.json';
}

const fsTruncate = (fileDescriptor) => {
    return new Promise((resolve, reject) => {
        fs.ftruncate(fileDescriptor, err => {
            !err ? resolve(fileDescriptor) : reject(err)
        })
    });
}

const fsUnlink = path => {
    return new Promise((resolve, reject) => {
        fs.unlink(path, err => {
            !err ? resolve(true) : reject(err)
        })
    });
}

module.exports = {
    async create(dir, file, data) {
        try {
            const filePath = mainFilePath(dir, file)
            if (!(fs.existsSync(filePath))) {
                const fileDescriptor = await fsOpen(filePath, 'wx');
                await fsWriteFile(fileDescriptor, data);
                await fsClose(fileDescriptor)
            } else {
                return Promise.reject('File already exist!');
            }
        } catch (error) {
            return Promise.reject(error.message);
        }
    },
    async readFile(dir, file) {
        try {
            const filePath = mainFilePath(dir, file);
            return await readFile(filePath)
        } catch (error) {
            return Promise.reject(error.message)
        }
    },
    async update(dir, file, data) {
        try {
            const filePath = mainFilePath(dir, file);
            if (fs.existsSync(filePath)) {
                const fileDescriptor = await fsOpen(filePath, 'r+');
                await fsTruncate(fileDescriptor);
                await fsWriteFile(fileDescriptor, data);
                await fsClose(fileDescriptor);
            } else {
                return Promise.reject('File not found')
            }
        } catch (error) {
            return Promise.reject(error.message)
        }
    },
    async delete(dir, file) {
        try {
            await fsUnlink(mainFilePath(dir, file))
        } catch (error) {
            return Promise.reject(error.message)
        }
    }
}