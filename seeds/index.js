
const mongoose = require("mongoose");
const cities = require("./cities");
const { places, descriptors } = require("./seedHelpers");
const Campground = require("../models/campground");

mongoose.connect("mongodb://localhost/yelpcamp", {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true
});

const db = mongoose.connection;
db.on("err", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});

const sample = (array) => array[Math.floor(Math.random() * array.length)];

const seedDB = async () => {
    await Campground.deleteMany({});
    const price = Math.floor(Math.random() * (100 - 20) + 20);
    for (let i = 0; i < 200; i++) {
        const rCity = sample(cities);
        const camp = new Campground({
            author: "6018a2547c75dbb34cb0ad9b",
            location: `${ rCity.city }, ${ rCity.state }`,
            title: `${ sample(descriptors) } ${ sample(places) }`,
            images: [{
                url: 'https://res.cloudinary.com/dduylsrwc/image/upload/v1612709188/YelpCamp/osj1ormczukp9gwffuml.jpg',
                filename: 'YelpCamp/osj1ormczukp9gwffuml'
            },
            {
                url: 'https://res.cloudinary.com/dduylsrwc/image/upload/v1612709190/YelpCamp/ybygvqkc6nlswtdlodxq.jpg',
                filename: 'YelpCamp/ybygvqkc6nlswtdlodxq'
            },
            {
                url: 'https://res.cloudinary.com/dduylsrwc/image/upload/v1612709193/YelpCamp/iyd6fmevy9wpbzx5u5bu.jpg',
                filename: 'YelpCamp/iyd6fmevy9wpbzx5u5bu'
            }],
            description: "Lorem ipsum dolor, sit amet consectetur adipisicing elit. Voluptatum illum incidunt laboriosam commodi laudantium magnam officiis dicta quod amet, ipsum impedit eos quisquam deserunt facilis omnis et, nesciunt consectetur nemo.",
            price: 20,
            geometry: {
                type: 'Point',
                coordinates: [rCity.longitude, rCity.latitude]
            },
            author: "601689dda4f2c35364abd40a"
        });
        await camp.save()
    }
}

seedDB().then(() => {
    mongoose.connection.close();
});