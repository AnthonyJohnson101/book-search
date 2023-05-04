//user query
export const GET_ME = gql`
    query getme($userId: ID!) {
        getme(userId: $userId) {
            _id
            username
            email
            savedBooks {
                bookId
                authors
                description
                title
                image
                link
            }
            bookCount
        }
    }
`