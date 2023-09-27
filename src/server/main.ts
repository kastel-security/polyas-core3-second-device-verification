import express from 'express'
import ViteExpress from 'vite-express'
import { logIfNotFull } from './logging'

const app = express()
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.post('/log', function (req, res) {
  void (logIfNotFull(req.body.info))
  res.sendStatus(200)
})

ViteExpress.listen(app, 5000, () => {
  console.log('Server is listening on port 5000...')
})
