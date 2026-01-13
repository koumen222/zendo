import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    city: {
      type: String,
      required: true,
      trim: true,
    },
    address: {
      type: String,
      required: true,
      trim: true,
    },
    productSlug: {
      type: String,
      required: true,
      trim: true,
    },
    quantity: {
      type: Number,
      default: 1,
      min: 1,
    },
    totalPrice: {
      type: String,
      default: '',
    },
    productName: {
      type: String,
      default: '',
    },
    productPrice: {
      type: String,
      default: '',
    },
    productImages: {
      type: [String],
      default: [],
    },
    productShortDesc: {
      type: String,
      default: '',
    },
    productFullDesc: {
      type: String,
      default: '',
    },
    productBenefits: {
      type: [String],
      default: [],
    },
    productUsage: {
      type: String,
      default: '',
    },
    productGuarantee: {
      type: String,
      default: '',
    },
    productDeliveryInfo: {
      type: String,
      default: '',
    },
    productReviews: {
      type: [
        {
          author: String,
          rating: Number,
          comment: String,
          date: String,
        },
      ],
      default: [],
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model('Order', orderSchema);

