const Campground = require("../models/campground");
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const mapBoxToken = process.env.MAPBOX_TOKEN;

const geocoder = mbxGeocoding({ accessToken: mapBoxToken });

const { cloudinary } = require("../cloudinary");


module.exports = {
    async index(req, res) {
        const campgrounds = await Campground.find({});
        res.render("campgrounds/index", { campgrounds });
    },

    renderNewForm(req, res) {
        res.render("campgrounds/new")
    },

    async createCampground(req, res, next) {
        const geodata = await geocoder.forwardGeocode({
            query: req.body.campground.location,
            limit: 1
        }).send();

        const campground = new Campground(req.body.campground);
        campground.geometry = geodata.body.features[0].geometry
        campground.author = req.user._id;
        // map over req.files from multer
        campground.images = req.files.map(file => ({ url: file.path, filename: file.filename }));
        await campground.save();
        console.log(campground);
        req.flash("success", "Successfully made a new campground");
        res.redirect(`/campgrounds/${ campground._id }`);
    },

    async showCampground(req, res) {
        // need to populate the reviews in because it's just object IDs at this point
        const campground = await Campground.findById(req.params.id)
            // for each review, need to populate its author in
            .populate({
                path: "reviews",
                populate: {
                    path: "author"
                }
            })
            .populate("author");

        if (!campground) {
            req.flash("error", "Campground not found!");
            res.redirect("/campgrounds");
        } else {
            res.render("campgrounds/show", { campground });
        }
    },

    async renderEditForm(req, res) {
        const { id } = req.params;
        const campground = await Campground.findById(id);
        if (!campground) {
            req.flash("error", "Campground not found!");
            res.redirect("/campgrounds")
        } else {
            res.render("campgrounds/edit", { campground });
        }
    },

    async updateCampground(req, res) {
        const { id } = req.params;
        const campground = await Campground.findById(id);
        console.log(req.body);
        const images = req.files.map(f => {
            return {
                url: f.path,
                filename: f.filename
            }
        });
        campground.images.push(...images);
        await campground.save();

        if (req.body.deleteImages) {

            // delete from cloudinary
            for (let filename of req.body.deleteImages) {
                await cloudinary.uploader.destroy(filename);
            }

            // pull from images array all images where the filename of that image is in req.body.deleteImages
            await campground.updateOne({ $pull: { images: { filename: { $in: req.body.deleteImages } } } });
            console.log(campground);
        }

        if (!campground.author.equals(req.user._id)) {
            req.flash("error", "You don't have the permission to do that!");
            // const campground = await Campground.findByIdAndUpdate(id, {...req.body.campground});
            // find out more aobut the spread operator
        } else {
            req.flash("success", "Successfully updated campground!");
        }
        res.redirect(`/campgrounds/${ campground._id }`);

    },

    async deleteCampground(req, res) {
        const { id } = req.params;
        await Campground.findByIdAndDelete(id);
        res.redirect("/campgrounds");
    }

}