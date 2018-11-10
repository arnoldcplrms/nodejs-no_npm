const fs = require('fs'),
    path = require('path'),
    { responseHelper } = require('./helpers')


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

const fsRead = (path) => {
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
                await fsClose(fileDescriptor);
                return responseHelper(201, { message: "User created" })
            } else {
                return responseHelper(404, { error: "File already exist!" });
            }
        } catch (error) {
            return responseHelper(500, { error: error.message })
        }
    },
    async read(dir, file) {
        try {
            const filePath = mainFilePath(dir, file);
            return JSON.parse(await fsRead(filePath));
        } catch (error) {
            return responseHelper(404, { message: "User not found" });
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
                return responseHelper(200, { message: "Update user successful" })
            } else {
                return responseHelper(404, { error: 'Data not found' })
            }
        } catch (error) {
            return responseHelper(500, { error: error.message });
        }
    },
    async delete(dir, file) {
        try {
            await fsUnlink(mainFilePath(dir, file))
            return responseHelper(200, { message: "Deleted successfuly" })
        } catch (error) {
            return responseHelper(500, { error: error.message });
        }
    }
}