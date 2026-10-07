import mongoose from 'mongoose';

const knowledgeArticleSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, maxlength: 200 },
  content: { type: String, required: true, maxlength: 20000 },
  category: { type: String, required: true, trim: true, index: true },
  department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department', index: true },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  status: { type: String, enum: ['Draft', 'Review', 'Published', 'Archived'], default: 'Draft', index: true },
  tags: [{ type: String, trim: true }],
  views: { type: Number, min: 0, default: 0 },
  document: { type: mongoose.Schema.Types.ObjectId, ref: 'Document' },
}, { timestamps: true });

knowledgeArticleSchema.index({ status: 1, category: 1, updatedAt: -1 });

export default mongoose.model('KnowledgeArticle', knowledgeArticleSchema);
