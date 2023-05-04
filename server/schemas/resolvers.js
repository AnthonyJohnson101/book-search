const { AuthenticationError } = require('apollo-server-express');
const { User } = require('../models');
const { signToken } = require('../utils/auth');

//resolvers
const resolvers = {
    //finds user
    Query: {
        getme: async (parent, { userId }) => {
            return User.findOne({ _id: userId })
        }
    },

    Mutation: {
        //compares passwords, returns the user and the jwt token
        login: async (parent, { email, password }) => {
            const user = await User.findOne({ email });

            if (!user) throw new AuthenticationError('No profile with this email found!');

            const correctPw = await user.isCorrectPassword(password)

            if (!correctPw) throw new AuthenticationError('Incorrect password!');

            const token = signToken(user);
            return { token, user }
        },
        //adds a user to our database and returns with a jwt token 
        addUser: async (parent, { username, email, password }) => {
            const user = await User.create({ username, email, password })
            const token = signToken(user)

            return { token, user };
        },
        //finds the user, adds the book to saveBooks 
        saveBook: async (parent, { userId, book }) => {
            const user = await User.findOneAndUpdate(
                { _id: userId },
                {
                    $addToSet: { savedBooks: book }
                },
                {
                    new: true,
                    runValidators: true
                }
            )
            return user
        },
        //finds the user in question and then removes the book
        removeBook: async (parent, { userId, book }) => {
            const user = await User.findOneAndUpdate(
                { _id: userId },
                { $pull: { savedBooks: book } },
                { new: true }
            )
            return user
        }
    }
}

module.exports = resolvers;