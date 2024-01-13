require("dotenv").config()
const express = require("express")
const path = require("path")
var morgan = require("morgan")
const app = express()
const Person = require("./models/person")
// const mongoose = require("mongoose")

const errorHandler = (error, request, response, next) => {
	console.error(error.message)

	if (error.name === "CastError") {
		return response.status(400).send({ error: "malformatted id" })
	} else if(error.name === "ValidationError"){
		return response.status(400).json({ error: error.message })
	}
	next(error)
}

const PORT = process.env.PORT
app.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`)
})

const publicPath1 = path.join(__dirname, "build")
app.use(express.static(publicPath1))
app.use(express.json())
app.use(morgan(":method :url :body"))
app.use(errorHandler)
app.set("views", "./views")
app.set("view engine", "pug")

morgan.token("body", req => {
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

// show all
app.get("/api/persons", (request, response) => {
	Person.find({}).then(persons => {
		response.json(persons)
	})
})

// show how many data and render time
app.get("/info", (request, response) => {
	let today = new Date()
	let length = Object.keys(persons).length
	response.render("index", { data: { today: today, length: length } })
})

// show dedicated person
app.get("/api/persons/:id", (request, response, next) => {
	Person.findById(request.params.id)
		.then(person => {
			if (person) {
				response.json(person)
			} else {
				response.status(404).end()
			}
		})
		.catch(error => next(error))
})

// delete dedicated person
app.delete("/api/persons/:id",  (request, response,next) => {
	Person.findByIdAndDelete(request.params.id)
		.then(
			response.status(204).end()
		)
		.catch(error => next(error))
})

// add dedicated person
app.post("/api/persons", (request, response, next) => {
	const body = request.body

	if (body.name === undefined) {
		return response.status(400).json({ error: "content missing" })
	}

	Person.findOne({ name: body.name })
		.then(existingPerson => {
			if (!existingPerson) {
				const person = new Person({
					name: body.name,
					number: body.number,
				})

				person.save()
					.then(savedPerson => {
						return response.json(savedPerson)
					})
					.catch(error => next(error))
			}
		})
		.catch(error => next(error))
})

app.put("/api/persons/:id", (request, response, next) => {
	const { name, number } = request.body

	Person.findByIdAndUpdate(request.params.id, { name, number }, { new: true, runValidators: true, context: "query" })
		.then(updatedNote => {
			response.json(updatedNote)
		})
		.catch(error => next(error))
})