const mongoose = require("mongoose")

const password = process.argv[2]
const nameArg = process.argv[3]
const numberArg = process.argv[4]

if(process.argv.length < 3){
	console.log("give password as argument")
	process.exit(1)
}

const url = `mongodb+srv://yapshinxu:${password}@cluster0.tloqihc.mongodb.net/?retryWrites=true&w=majority`
mongoose.set("strictQuery", false)
mongoose.connect(url)

const personSchema = new mongoose.Schema({
	name: String,
	number: String,
})

const Person = mongoose.model("Person", personSchema)

// add new person
if(process.argv.length > 3){
	const person = new Person({
		name: nameArg,
		number: numberArg
	})

	person.save().then(
		console.log("added " + nameArg + " number " + numberArg + " to phonebook"),
		mongoose.connection.close()
	)
}else{
	// show all entries in the db
	Person.find({}).then(result => {
		console.log("phonebook:")
		result.forEach(person => {
			console.log(person.name + " " + person.number)
		})
		mongoose.connection.close()
	})
}