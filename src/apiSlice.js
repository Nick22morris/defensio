// src/api/apiSlice.js
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const apiSlice = createApi({
    reducerPath: 'api',
    baseQuery: fetchBaseQuery({ baseUrl: 'https://flask-backend-572297073167.us-south1.run.app' }),
    endpoints: (builder) => ({
        fetchNode: builder.query({
            query: (id) => `/node/${id}`,
        }),
        updateNode: builder.mutation({
            query: ({ id, ...patch }) => ({
                url: `/node/${id}`,
                method: 'POST',
                body: patch,
            }),
        }),
    }),
});

export const { useFetchNodeQuery, useUpdateNodeMutation } = apiSlice;