import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";


@Schema({
    timestamps: true
})

export class User {

    @Prop({ unique: true })
    userid: number

    @Prop()
    name: string

    @Prop({ default: false }) // Default to unsubscribed
    isSubscribed: boolean;

    @Prop()
    city: string; // Add a field to store the user's city preference
}

export const UserSchema = SchemaFactory.createForClass(User) 