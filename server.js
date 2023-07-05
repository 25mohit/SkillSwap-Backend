const express = require('express')
const app = express()
const dotenv = require('dotenv').config()
const cors = require('cors')
const mongoose = require('mongoose')
mongoose.set('strictQuery', true)
const UserRoutes = require('./Routes/UserRoutes')
const SkillRoute = require('./Routes/SkillsRoute')
const multer = require('multer')
const { s3Uploadc2 } = require('./s3Service')

const PORT = 5656
app.use(cors())
app.use(cors({
    origin: 'https://skill-swap.netlify.app'
}))

app.use(express.urlencoded({ extended: false }))
app.use(express.json())
app.use('/user', UserRoutes)
app.use('/skill', SkillRoute)
app.use('/', (req, res) => {
    res.send("Hulalalla")
})

const storage = multer.memoryStorage()

const fileFilter = (req, file, cb) => {
    if(file.mimetype.split('/')[0] === 'image'){
        cb(null, true)
    } else {
        cb(new multer.MulterError('LIMIT_UNEXPECTED_FILE'), false)
    }
}
const upload = multer({ storage, fileFilter, limits:{ fileSize: 3000000} })

app.post("/upload/I", upload.single("file"), async (req, res) => {
    const result = await s3Uploadc2(req.file)
    res.json({status: true, message:"Image Updated Successfully", file: result.key})
})

app.use((error, req, res, next) => {
    if(error instanceof multer.MulterError){
        if(error.code === 'LIMIT_FILE_SIZE'){
            return res.status(400).json({status: false, message:"Image size is to large"})
        }
        if(error.code === 'LIMIT_UNEXPECTED_FILE'){
            return res.status(400).json({status: false, message:"Invalid Image Type"})
        }
    }
})

mongoose.connect(process.env.MONGO_URI).then(() => {
    app.listen(PORT, () => {
        console.log(`Server is started with MongoDB on PORT ${PORT}`);
    })
}).catch(err => console.log(err))