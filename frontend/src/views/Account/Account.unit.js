import Account from './Account'

describe('@views/Account', () => {
  it('is a valid view', () => {
    // expect(Account).toBeAViewComponent()
    expect(Account.name).toMatch('Account')

  })
})
