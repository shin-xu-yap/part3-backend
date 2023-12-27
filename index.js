const express = require('express')
var morgan = require('morgan')
const app = express()
const cors = require('cors')

app.use(cors())
app.use(express.json())
app.use(morgan(':method :url :body'))
app.set('views', './views')
app.set('view engine', 'pug')

morgan.token('body', req => {
  return JSON.stringify(req.body)
})

let persons = [
  { 
    "id": 1,
    "name": "Arto Hellas", 
    "number": "040-123456"
  },
  { 
    "id": 2,
    "name": "Ada Lovelace", 
    "number": "39-44-5323523"
  },
  { 
    "id": 3,
    "name": "Dan Abramov", 
    "number": "12-43-234345"
  },
  { 
    "id": 4,
    "name": "Mary Poppendieck", 
    "number": "39-23-6423122"
  }
]

// default page 
// app.get('/', (request, response) => {
//   response.send('<h1>Hello World!</h1>')
// })

// show all
app.get('/api/persons', (request, response) => {
  response.json(persons)
  console.log("Hello")
})

// show how many data and render time
app.get('/info', (request, response) => {
  let today = new Date();
  let length = Object.keys(persons).length;
  response.render("index", {data: {today: today, length: length}});
})

// show dedicated person
app.get('/api/persons/:id', (request, response) =>{
  const id = Number(request.params.id)
  const person = persons.find(person => person.id === id)
  if(person){
    response.json(person)
  }else{
    response.status(404).end()
  }
})

// delete dedicated person
app.delete('/api/persons/:id', (request, response) =>{
  const id = Number(request.params.id)
  persons = persons.filter(person => person.id !== id)
  response.status(204).end()
})

const generateId = () => {
  const maxId = persons.length > 0
    ? Math.max(...persons.map(n => n.id))
    : 0
  return maxId + 1
}

// add dedicated person
app.post('/api/persons', (request, response) =>{
  const body = request.body

  if (!body.name || !body.number) {
    return response.status(400).json({ 
      error: 'content missing' 
    })
  }

  const existingPerson = persons.find(person => person.name === body.name)
  if(existingPerson){
    return response.status(400).json({ 
      error: 'name must be unique' 
    })
  }

  const person = {
    name: body.name,
    number: body.number,

    id: generateId(),
  }

  persons = persons.concat(person)
  response.json(person)
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})