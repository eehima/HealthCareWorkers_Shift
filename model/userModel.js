import mongoose from "mongoose";
import bcrypt from "bcrypt";
import crypto from "crypto";

const userSchema = new mongoose.Schema({
    email:{
        type:String,
        required:true,
        unique:true,
        lowercase:true,
        trim:true
    },
    password:{
        type:String,
        required:true,
        minlength:8,
        select:false
    },
    role:{
        type:String,
        enum:["worker","admin", "facility"],
        required:true
    },
    isEmailVerified:{
        type:Boolean,
        default:false
    },
    emailVerificationToken:String,
    emailVerificationTokenExpires:Date,
    passwordResetToken:String,
    passwordResetTokenExpires:Date
},{
    timestamps:true
})
    
// Hash password before saving
userSchema.pre("save", async function(next){
    if(!this.isModified("password")) return next();
    this.password = await bcrypt.hash(this.password, 12);
    next();
});

// instance method to compare password
userSchema.methods.correctPassword = async function(candidatePassword, userPassword){
    return await bcrypt.compare(candidatePassword, userPassword);
};

// generate password reset token
userSchema.methods.createPasswordResetToken = function(){
    const resetToken = crypto.randomBytes(32).toString("hex");
    this.passwordResetToken = crypto.createHash("sha256").update(resetToken).digest("hex");
    this.passwordResetTokenExpires = Date.now() + 10 * 60 * 1000;

    return resetToken;
};

 export default mongoose.model("User", userSchema);
