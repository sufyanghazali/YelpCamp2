const mongoose = require("mongoose");
const Review = require("./review");
const { Schema } = mongoose;
const opts = { toJSON: { virtuals: true } };

const Image = new Schema({
    url: String,
    filename: String
});


Image.virtual("thumbnail").get(function () {
    return this.url.replace("/upload", "/upload/w_200");
});

const Campground = new Schema({
    title: String,
    price: Number,
    description: String,
    geometry: {
        type: {
            type: String,
            enum: ["Point"],
            required: true
        },
        coordinates: {
            type: [Number],
            required: true
        }
    },
    images: [Image],
    location: String,
    author: {
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: "Review" // referring to Review model
        }
    ]
}, opts);

Campground.virtual("properties.popUpMarkup").get(function () {
    return `<a href="/campgrounds/${ this.id }">${ this.title }</a><p>${ this.description.substring(0, 30) }...</p>`
});

// for deleting reviews associated with campground when deleting that campground
Campground.post("findOneAndDelete", async function (doc) {
    console.log(doc);
    if (doc) {
        await Review.deleteMany({
            _id: {
                $in: doc.reviews
            }
        });
    }
})

module.exports = mongoose.model("Campground", Campground);