Okay, so the actual problem here is that we're trying to solve is this.

We have two routes, one called `/testing` and one called `/testing2`. `/testing` works. `/testing2` does not work. The only real difference between these two is that `/testing2` uses parameters, whereas `/testing` doesn't.

So something to do with how we're passing the parameters is erroneous.

If you look in the `scripts` folder, there's a script called `batch-executor.ts`. This is the same thing we are trying to do in `/testing2`. This works as expected. So there must be something wrong with how we're passing the parameters in the next/react project over the simple typescript project.

Now this is using a new EIP 7702. This will not be in your training data. So it may look a bit strange.

But you can be assured that the addresses are correct. There is tokens to be sent. That's not the issue. The issue has got nothing to do with the contract being erroneous because the contract works when we're doing it in the script. It just doesn't work in the front end. The issue must be something to do with how we're passing the parameters in the next/react project over the simple typescript project.

<error>
Relay Error: Failed to relay transaction: The contract function "executeBatch" reverted. Contract Call: address: 0xCa91110AC49201A896cf379830D1b5A36993810f function: executeBatch(address[] targets, bytes[] data) args: (["0xfde4c96c8593536e31f229ea8f37b2ada2699bb2","0x833589fcd6edb6e08f4c7c32d4f71b54bda02913"], ["0xa9059cbb00000000000000000000000047d80912400ef8f8224531ebeb1ce8f2acf4b75a0000000000000000000000000000000000000000000000000000000000000045","0xa9059cbb00000000000000000000000047d80912400ef8f8224531ebeb1ce8f2acf4b75a0000000000000000000000000000000000000000000000000000000000000045"]) sender: 0x23e46D79200AC34AE656184162c6c0660c77dC68 Docs: https://viem.sh/docs/contract/writeContract Version: viem@2.29.2
</error>
