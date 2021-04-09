const Review = require("../models/review");
const Campground = require("../models/campground");

module.exports = {

    async createReview(req, res) {
        const campground = await Campground.findById(req.params.id);
        const review = new Review(req.body.review);
        review.author = req.user._id // associate review to user
        campground.reviews.push(review);
        await review.save()
        await campground.save();
        req.flash("success", "Created new review!");
        res.redirect(`/campgrounds/${campground._id}`);
    },

    async deleteReview(req, res) {
        const {id, reviewId} = req.params;
        // pull is removing "reviewId" from "review" field in Campground
        await Campground.findByIdAndUpdate(id, {$pull: {reviews: reviewId}}); // tf is this shit
        await Review.findByIdAndDelete(reviewId);
        req.flash("success", "Deleted review");
        res.redirect(`/campgrounds/${id}`);
    }

}