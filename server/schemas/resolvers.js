//IMPORTS
const { AuthenticationError } = require('apollo-server-express');
const { User } = require('../models');
const { signToken } = require('../utils/auth');

//Define resolvers
const resolvers = {
    //Our "getUser" query that finds the current user
    Query: {
        getUser: async (parent, { userId }) => {
            return User.findOne({ _id: userId })
        }
    },

    Mutation: {
        //Our "login" mutation that finds our user, and then compares passwords, and then returns the user and the jwt token
        login: async (parent, { email, password }) => {
            const user = await User.findOne({ email });

            if (!user) throw new AuthenticationError('No profile with this email found!');

            const correctPw = await user.isCorrectPassword(password)

            if (!correctPw) throw new AuthenticationError('Incorrect password!');

            const token = signToken(user);
            return { token, user }
        },
        //Our "adduser" mutation that simply adds a user to our database and returns that user with a jwt token 
        addUser: async (parent, { username, email, password }) => {
            const user = await User.create({ username, email, password })
            const token = signToken(user)

            return { token, user };
        },
        //Our "savebook" mutation that finds the user in question (in our case, the current user),
        //and then adds the book in question to the user's saveBooks field
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
        //Our "removebook" mutation that finds the user in question and then
        //removes the book in question from the user's saveBooks field
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