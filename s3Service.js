const { S3 } = require('aws-sdk')
const uuid = require("uuid").v4

exports.s3Uploadc2 = async ( file ) => {
    const s3 = new S3

    const param = {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: `${uuid()}-${file.originalname}`,
        Body: file.buffer
    }

    const result = await s3.upload(param).promise()
    return result
}