import mongoose,{ Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const levelSchema = new Schema(
    {
        Beginner: { type: Number, default: 0 },
        Easy: { type: Number, default: 0 },
        Trivial: { type: Number, default: 0 },
        Introductory: { type: Number, default: 0 },
        VeryEasy: { type: Number, default: 0 },
        Light: { type: Number, default: 0 },
        Basic: { type: Number, default: 0 },
        Simple: { type: Number, default: 0 },
        Casual: { type: Number, default: 0 },
        Amateur: { type: Number, default: 0 },
        Intermediate: { type: Number, default: 0 },
        Regular: { type: Number, default: 0 },
        Standard: { type: Number, default: 0 },
        Moderate: { type: Number, default: 0 },
        Tricky: { type: Number, default: 0 },
        Challenging: { type: Number, default: 0 },
        Skilled: { type: Number, default: 0 },
        Hard: { type: Number, default: 0 },
        Tough: { type: Number, default: 0 },
        Advanced: { type: Number, default: 0 },
        Difficult: { type: Number, default: 0 },
        Expert: { type: Number, default: 0 },
        Pro: { type: Number, default: 0 },
        Intense: { type: Number, default: 0 },
        Extreme: { type: Number, default: 0 },
        Brutal: { type: Number, default: 0 },
        Insane: { type: Number, default: 0 },
        Nightmare: { type: Number, default: 0 },
        Impossible: { type: Number, default: 0 },
        Mythic: { type: Number, default: 0 },
        Legendary: { type: Number, default: 0 },
        Super_level0: { type: Number, default: 0 },
        Super_level1: { type: Number, default: 0 }
    }   
)

levelSchema.plugin(mongooseAggregatePaginate)

export const Level = mongoose.model("Level", levelSchema);