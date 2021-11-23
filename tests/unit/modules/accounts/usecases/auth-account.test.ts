import { Account } from '@/modules/accounts/domain/entities/account'
import { CreateAccountParams } from '@/modules/accounts/domain/usecases/create-account'
import { InvalidAccessToken } from '@/modules/accounts/domain/usecases/errors/invalid-access-token'
import { DbAuthAccount } from '@/modules/accounts/usecases/auth-account'
import { MockedEncrypter } from '@t/mocks/infra/encrypter'
import { InMemoryAccountsRepository } from '@t/mocks/infra/repositories/in-memory-account-repository'
import mockedUUIDGenerator from '@t/mocks/infra/uuid-generator'

describe('Auth Account Usecase', () => {
  const inMemoryAccountRepository = new InMemoryAccountsRepository()
  const mockedEncrypter = new MockedEncrypter()
  const sut = new DbAuthAccount(mockedEncrypter, inMemoryAccountRepository)

  const fakeUUID = mockedUUIDGenerator.generate()
  const fakeAccountParams: CreateAccountParams = {
    name: 'John Doe',
    email: 'johndoe@mail.com',
    password: 'secret_pass'
  }
  const fakeAccount = Account.create(fakeAccountParams, fakeUUID).value as Account

  beforeEach(() => inMemoryAccountRepository.truncate())

  describe('Find for existing id', () => {
    it('Should return an error if receive an invalid access token', async () => {
      jest.spyOn(mockedEncrypter, 'decrypt').mockResolvedValueOnce(null)
      const result = await sut.auth('invalid_token')
      expect(result.isLeft()).toBeTruthy()
      expect(result.value).toEqual(new InvalidAccessToken('invalid_token'))
    })

    it('Should not call findAccount method if token is invalid', async () => {
      jest.spyOn(mockedEncrypter, 'decrypt').mockResolvedValueOnce(null)
      const findById = jest.spyOn(inMemoryAccountRepository, 'findById')
      await sut.auth('invalid_token')
      expect(findById).not.toHaveBeenCalled()
    })

    it('Should return an account data if authentication succeeds', async () => {
      await inMemoryAccountRepository.create(fakeAccount)
      const result = await sut.auth('valid_token')
      expect(result.isRight()).toBeTruthy()
      expect(result.value).toEqual(expect.objectContaining({ ...fakeAccountParams, id: fakeUUID }))
    })

    it('Should pass long the error if AccountRepository returns one', async () => {
      jest.spyOn(inMemoryAccountRepository, 'findById').mockRejectedValueOnce(new Error())
      const error = sut.auth('token')
      await expect(error).rejects.toThrow()
    })
  })
})