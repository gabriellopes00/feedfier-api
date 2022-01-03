import { Either, left, right } from '@/shared/either'
import { Entity } from '@/shared/entity'
import { Category } from '../value-objects/category'
import { InvalidCategoryError } from '../value-objects/errors/invalid-category'
import { Author, AuthorData, AuthorErrors } from './author'

export interface FeedbackData {
  title?: string
  content: string
  author?: AuthorData
  isPrivate?: boolean
  category: 'COMMENT' | 'ISSUE' | 'IDEA' | 'OTHER'
  serviceId: string
}

export interface FeedbackErrors extends AuthorErrors, InvalidCategoryError {}

export class Feedback extends Entity<FeedbackData> {
  get id() {
    return this._id
  }

  get title() {
    return this.data.title || null
  }

  get content() {
    return this.data.content
  }

  get category() {
    return this.data.category
  }

  get serviceId() {
    return this.data.serviceId
  }

  get author() {
    return this.data.author
  }

  get isPrivate() {
    return this.data.isPrivate
  }

  get createdAt() {
    return this._createdAt
  }

  private constructor(data: FeedbackData, id: string) {
    super(data, id)
  }

  static create(data: FeedbackData, id: string): Either<FeedbackErrors, Feedback> {
    if (data.author) {
      const authorResult = Author.create({ name: data.author.name, email: data.author.email })
      if (authorResult.isLeft()) data.author = null
    }

    data.isPrivate = data.isPrivate ?? true

    const categoryResult = Category.create(data.category)
    if (categoryResult.isLeft()) return left(categoryResult.value)

    const feedback = new Feedback(data, id)
    return right(feedback)
  }

  // static adapt(data: ServiceData & { id: string; apiKey: string }): Service {
  //   const service = new Service(data, data.id)
  //   this._apiKey = data.apiKey
  //   return service
  // }
}