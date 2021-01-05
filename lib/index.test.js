const uploader = require('./index');





jest.mock('aws-sdk', () => {
    const mS3Instance = function () {
        return {
            upload: (file, callback) => {
                callback(null, {
                    Location: 'https://s3.a.com/path/123456.jpg'
                })
            },
            promise: Promise.resolve()
        }
    };

    return { S3: mS3Instance };
});
describe('The s3 uploader', () => {
    it('should upload the image file, and return the public url', () => {
        const file = {
            path: '/path',
            hash: '123456',
            ext: '.jpg',
            buffer: 'abcdefge'
        }
        s3Uploader = uploader.init({});
        s3Uploader.upload(file);

        expect(file.url).toBe('https://s3.a.com/path/123456.jpg')
    })


    it('should upload the image file, and return the s3 url', () => {
        const file = {
            path: 'path',
            hash: '123456',
            ext: '.pdf',
            buffer: 'abcdefge'
        }
        s3Uploader = uploader.init({
            params: {
                Bucket: 'mybucket',
            },
        });
        s3Uploader.upload(file, {
            Bucket: 'mybucket',
        });

        expect(file.url).toBe('s3://mybucket/path/123456.pdf')
    })
})