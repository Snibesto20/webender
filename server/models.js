import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true, trim: true, lowercase: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ['admin', 'marketing', 'guest'], default: 'guest' },
  emailsSent: { type: Number, default: 0 }
}, { timestamps: true });

UserSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: (_doc, ret) => {
    ret.id = ret._id;
    delete ret._id;
    delete ret.passwordHash;
  }
});

export const User = mongoose.model('User', UserSchema, 'users');

const ClientSchema = new mongoose.Schema({
  name: { type: String, required: true },
  tag: { type: String, default: 'pending' },
  serviceNeeded: { type: String, default: '' },
  notes: { type: String, default: '' },
  moneyMade: { type: Number, default: 0 },
  marketer: { type: String, default: '' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  contacts: { type: [String], default: [] }
}, { timestamps: true });

ClientSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: (_doc, ret) => {
    ret.id = ret._id;
    delete ret._id;
  }
});

export const Client = mongoose.model('Client', ClientSchema);

const EventSchema = new mongoose.Schema({
  note: { type: String, required: true, trim: true, maxlength: 2000 },
  date: { type: Date, required: true },
  clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Client', default: null },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  createdByName: { type: String, default: '' },
  archived: { type: Boolean, default: false }
}, { timestamps: true });

EventSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: (_doc, ret) => {
    ret.id = ret._id;
    delete ret._id;
  }
});

export const Event = mongoose.model('Event', EventSchema);
