const mongoose=require('mongoose');
const Scheme=mongoose.Schema;
const favoriteScheme=new Scheme({
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User'
    },
    dishes:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Dish'
    }]
    
},{
    timestamps:true
});
let Favorites=mongoose.model(favoriteScheme);
module.exports=Favorites;