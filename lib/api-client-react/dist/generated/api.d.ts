import type { QueryKey, UseMutationOptions, UseMutationResult, UseQueryOptions, UseQueryResult } from "@tanstack/react-query";
import type { Analytics, CreateGroceryItemBody, CreateInventoryItemBody, CreateRecipeBody, GetAnalyticsParams, GetRecipeSuggestionsParams, GetSubstitutionsParams, GroceryItem, HealthStatus, InventoryItem, InventorySummary, ListInventoryItemsParams, Notification, Recipe, Substitution, UpdateGroceryItemBody, UpdateInventoryItemBody, UpdateProfileBody, UserProfile } from "./api.schemas";
import { customFetch } from "../custom-fetch";
import type { ErrorType, BodyType } from "../custom-fetch";
type AwaitedInput<T> = PromiseLike<T> | T;
type Awaited<O> = O extends AwaitedInput<infer T> ? T : never;
type SecondParameter<T extends (...args: never) => unknown> = Parameters<T>[1];
/**
 * Returns server health status
 * @summary Health check
 */
export declare const getHealthCheckUrl: () => string;
export declare const healthCheck: (options?: RequestInit) => Promise<HealthStatus>;
export declare const getHealthCheckQueryKey: () => readonly ["/api/healthz"];
export declare const getHealthCheckQueryOptions: <TData = Awaited<ReturnType<typeof healthCheck>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof healthCheck>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof healthCheck>>, TError, TData> & {
    queryKey: QueryKey;
};
export type HealthCheckQueryResult = NonNullable<Awaited<ReturnType<typeof healthCheck>>>;
export type HealthCheckQueryError = ErrorType<unknown>;
/**
 * @summary Health check
 */
export declare function useHealthCheck<TData = Awaited<ReturnType<typeof healthCheck>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof healthCheck>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary List all fridge inventory items
 */
export declare const getListInventoryItemsUrl: (params?: ListInventoryItemsParams) => string;
export declare const listInventoryItems: (params?: ListInventoryItemsParams, options?: RequestInit) => Promise<InventoryItem[]>;
export declare const getListInventoryItemsQueryKey: (params?: ListInventoryItemsParams) => readonly ["/api/inventory", ...ListInventoryItemsParams[]];
export declare const getListInventoryItemsQueryOptions: <TData = Awaited<ReturnType<typeof listInventoryItems>>, TError = ErrorType<unknown>>(params?: ListInventoryItemsParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listInventoryItems>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof listInventoryItems>>, TError, TData> & {
    queryKey: QueryKey;
};
export type ListInventoryItemsQueryResult = NonNullable<Awaited<ReturnType<typeof listInventoryItems>>>;
export type ListInventoryItemsQueryError = ErrorType<unknown>;
/**
 * @summary List all fridge inventory items
 */
export declare function useListInventoryItems<TData = Awaited<ReturnType<typeof listInventoryItems>>, TError = ErrorType<unknown>>(params?: ListInventoryItemsParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listInventoryItems>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Add a new item to fridge inventory
 */
export declare const getCreateInventoryItemUrl: () => string;
export declare const createInventoryItem: (createInventoryItemBody: CreateInventoryItemBody, options?: RequestInit) => Promise<InventoryItem>;
export declare const getCreateInventoryItemMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createInventoryItem>>, TError, {
        data: BodyType<CreateInventoryItemBody>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof createInventoryItem>>, TError, {
    data: BodyType<CreateInventoryItemBody>;
}, TContext>;
export type CreateInventoryItemMutationResult = NonNullable<Awaited<ReturnType<typeof createInventoryItem>>>;
export type CreateInventoryItemMutationBody = BodyType<CreateInventoryItemBody>;
export type CreateInventoryItemMutationError = ErrorType<unknown>;
/**
 * @summary Add a new item to fridge inventory
 */
export declare const useCreateInventoryItem: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createInventoryItem>>, TError, {
        data: BodyType<CreateInventoryItemBody>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof createInventoryItem>>, TError, {
    data: BodyType<CreateInventoryItemBody>;
}, TContext>;
/**
 * @summary Get a single inventory item
 */
export declare const getGetInventoryItemUrl: (id: number) => string;
export declare const getInventoryItem: (id: number, options?: RequestInit) => Promise<InventoryItem>;
export declare const getGetInventoryItemQueryKey: (id: number) => readonly [`/api/inventory/${number}`];
export declare const getGetInventoryItemQueryOptions: <TData = Awaited<ReturnType<typeof getInventoryItem>>, TError = ErrorType<void>>(id: number, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getInventoryItem>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getInventoryItem>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetInventoryItemQueryResult = NonNullable<Awaited<ReturnType<typeof getInventoryItem>>>;
export type GetInventoryItemQueryError = ErrorType<void>;
/**
 * @summary Get a single inventory item
 */
export declare function useGetInventoryItem<TData = Awaited<ReturnType<typeof getInventoryItem>>, TError = ErrorType<void>>(id: number, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getInventoryItem>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Update an inventory item
 */
export declare const getUpdateInventoryItemUrl: (id: number) => string;
export declare const updateInventoryItem: (id: number, updateInventoryItemBody: UpdateInventoryItemBody, options?: RequestInit) => Promise<InventoryItem>;
export declare const getUpdateInventoryItemMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateInventoryItem>>, TError, {
        id: number;
        data: BodyType<UpdateInventoryItemBody>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof updateInventoryItem>>, TError, {
    id: number;
    data: BodyType<UpdateInventoryItemBody>;
}, TContext>;
export type UpdateInventoryItemMutationResult = NonNullable<Awaited<ReturnType<typeof updateInventoryItem>>>;
export type UpdateInventoryItemMutationBody = BodyType<UpdateInventoryItemBody>;
export type UpdateInventoryItemMutationError = ErrorType<unknown>;
/**
 * @summary Update an inventory item
 */
export declare const useUpdateInventoryItem: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateInventoryItem>>, TError, {
        id: number;
        data: BodyType<UpdateInventoryItemBody>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof updateInventoryItem>>, TError, {
    id: number;
    data: BodyType<UpdateInventoryItemBody>;
}, TContext>;
/**
 * @summary Delete an inventory item
 */
export declare const getDeleteInventoryItemUrl: (id: number) => string;
export declare const deleteInventoryItem: (id: number, options?: RequestInit) => Promise<void>;
export declare const getDeleteInventoryItemMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof deleteInventoryItem>>, TError, {
        id: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof deleteInventoryItem>>, TError, {
    id: number;
}, TContext>;
export type DeleteInventoryItemMutationResult = NonNullable<Awaited<ReturnType<typeof deleteInventoryItem>>>;
export type DeleteInventoryItemMutationError = ErrorType<unknown>;
/**
 * @summary Delete an inventory item
 */
export declare const useDeleteInventoryItem: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof deleteInventoryItem>>, TError, {
        id: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof deleteInventoryItem>>, TError, {
    id: number;
}, TContext>;
/**
 * @summary Get a summary of inventory status
 */
export declare const getGetInventorySummaryUrl: () => string;
export declare const getInventorySummary: (options?: RequestInit) => Promise<InventorySummary>;
export declare const getGetInventorySummaryQueryKey: () => readonly ["/api/inventory/summary"];
export declare const getGetInventorySummaryQueryOptions: <TData = Awaited<ReturnType<typeof getInventorySummary>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getInventorySummary>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getInventorySummary>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetInventorySummaryQueryResult = NonNullable<Awaited<ReturnType<typeof getInventorySummary>>>;
export type GetInventorySummaryQueryError = ErrorType<unknown>;
/**
 * @summary Get a summary of inventory status
 */
export declare function useGetInventorySummary<TData = Awaited<ReturnType<typeof getInventorySummary>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getInventorySummary>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary List all active notifications
 */
export declare const getListNotificationsUrl: () => string;
export declare const listNotifications: (options?: RequestInit) => Promise<Notification[]>;
export declare const getListNotificationsQueryKey: () => readonly ["/api/notifications"];
export declare const getListNotificationsQueryOptions: <TData = Awaited<ReturnType<typeof listNotifications>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listNotifications>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof listNotifications>>, TError, TData> & {
    queryKey: QueryKey;
};
export type ListNotificationsQueryResult = NonNullable<Awaited<ReturnType<typeof listNotifications>>>;
export type ListNotificationsQueryError = ErrorType<unknown>;
/**
 * @summary List all active notifications
 */
export declare function useListNotifications<TData = Awaited<ReturnType<typeof listNotifications>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listNotifications>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Get recipe suggestions based on available ingredients
 */
export declare const getGetRecipeSuggestionsUrl: (params?: GetRecipeSuggestionsParams) => string;
export declare const getRecipeSuggestions: (params?: GetRecipeSuggestionsParams, options?: RequestInit) => Promise<Recipe[]>;
export declare const getGetRecipeSuggestionsQueryKey: (params?: GetRecipeSuggestionsParams) => readonly ["/api/recipes/suggestions", ...GetRecipeSuggestionsParams[]];
export declare const getGetRecipeSuggestionsQueryOptions: <TData = Awaited<ReturnType<typeof getRecipeSuggestions>>, TError = ErrorType<unknown>>(params?: GetRecipeSuggestionsParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getRecipeSuggestions>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getRecipeSuggestions>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetRecipeSuggestionsQueryResult = NonNullable<Awaited<ReturnType<typeof getRecipeSuggestions>>>;
export type GetRecipeSuggestionsQueryError = ErrorType<unknown>;
/**
 * @summary Get recipe suggestions based on available ingredients
 */
export declare function useGetRecipeSuggestions<TData = Awaited<ReturnType<typeof getRecipeSuggestions>>, TError = ErrorType<unknown>>(params?: GetRecipeSuggestionsParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getRecipeSuggestions>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary List saved recipes
 */
export declare const getListRecipesUrl: () => string;
export declare const listRecipes: (options?: RequestInit) => Promise<Recipe[]>;
export declare const getListRecipesQueryKey: () => readonly ["/api/recipes"];
export declare const getListRecipesQueryOptions: <TData = Awaited<ReturnType<typeof listRecipes>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listRecipes>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof listRecipes>>, TError, TData> & {
    queryKey: QueryKey;
};
export type ListRecipesQueryResult = NonNullable<Awaited<ReturnType<typeof listRecipes>>>;
export type ListRecipesQueryError = ErrorType<unknown>;
/**
 * @summary List saved recipes
 */
export declare function useListRecipes<TData = Awaited<ReturnType<typeof listRecipes>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listRecipes>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Create or save a recipe
 */
export declare const getCreateRecipeUrl: () => string;
export declare const createRecipe: (createRecipeBody: CreateRecipeBody, options?: RequestInit) => Promise<Recipe>;
export declare const getCreateRecipeMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createRecipe>>, TError, {
        data: BodyType<CreateRecipeBody>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof createRecipe>>, TError, {
    data: BodyType<CreateRecipeBody>;
}, TContext>;
export type CreateRecipeMutationResult = NonNullable<Awaited<ReturnType<typeof createRecipe>>>;
export type CreateRecipeMutationBody = BodyType<CreateRecipeBody>;
export type CreateRecipeMutationError = ErrorType<unknown>;
/**
 * @summary Create or save a recipe
 */
export declare const useCreateRecipe: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createRecipe>>, TError, {
        data: BodyType<CreateRecipeBody>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof createRecipe>>, TError, {
    data: BodyType<CreateRecipeBody>;
}, TContext>;
/**
 * @summary Get a recipe by ID
 */
export declare const getGetRecipeUrl: (id: number) => string;
export declare const getRecipe: (id: number, options?: RequestInit) => Promise<Recipe>;
export declare const getGetRecipeQueryKey: (id: number) => readonly [`/api/recipes/${number}`];
export declare const getGetRecipeQueryOptions: <TData = Awaited<ReturnType<typeof getRecipe>>, TError = ErrorType<void>>(id: number, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getRecipe>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getRecipe>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetRecipeQueryResult = NonNullable<Awaited<ReturnType<typeof getRecipe>>>;
export type GetRecipeQueryError = ErrorType<void>;
/**
 * @summary Get a recipe by ID
 */
export declare function useGetRecipe<TData = Awaited<ReturnType<typeof getRecipe>>, TError = ErrorType<void>>(id: number, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getRecipe>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Delete a recipe
 */
export declare const getDeleteRecipeUrl: (id: number) => string;
export declare const deleteRecipe: (id: number, options?: RequestInit) => Promise<void>;
export declare const getDeleteRecipeMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof deleteRecipe>>, TError, {
        id: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof deleteRecipe>>, TError, {
    id: number;
}, TContext>;
export type DeleteRecipeMutationResult = NonNullable<Awaited<ReturnType<typeof deleteRecipe>>>;
export type DeleteRecipeMutationError = ErrorType<unknown>;
/**
 * @summary Delete a recipe
 */
export declare const useDeleteRecipe: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof deleteRecipe>>, TError, {
        id: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof deleteRecipe>>, TError, {
    id: number;
}, TContext>;
/**
 * @summary Get grocery list items
 */
export declare const getListGroceryItemsUrl: () => string;
export declare const listGroceryItems: (options?: RequestInit) => Promise<GroceryItem[]>;
export declare const getListGroceryItemsQueryKey: () => readonly ["/api/grocery"];
export declare const getListGroceryItemsQueryOptions: <TData = Awaited<ReturnType<typeof listGroceryItems>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listGroceryItems>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof listGroceryItems>>, TError, TData> & {
    queryKey: QueryKey;
};
export type ListGroceryItemsQueryResult = NonNullable<Awaited<ReturnType<typeof listGroceryItems>>>;
export type ListGroceryItemsQueryError = ErrorType<unknown>;
/**
 * @summary Get grocery list items
 */
export declare function useListGroceryItems<TData = Awaited<ReturnType<typeof listGroceryItems>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listGroceryItems>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Add an item to the grocery list
 */
export declare const getCreateGroceryItemUrl: () => string;
export declare const createGroceryItem: (createGroceryItemBody: CreateGroceryItemBody, options?: RequestInit) => Promise<GroceryItem>;
export declare const getCreateGroceryItemMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createGroceryItem>>, TError, {
        data: BodyType<CreateGroceryItemBody>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof createGroceryItem>>, TError, {
    data: BodyType<CreateGroceryItemBody>;
}, TContext>;
export type CreateGroceryItemMutationResult = NonNullable<Awaited<ReturnType<typeof createGroceryItem>>>;
export type CreateGroceryItemMutationBody = BodyType<CreateGroceryItemBody>;
export type CreateGroceryItemMutationError = ErrorType<unknown>;
/**
 * @summary Add an item to the grocery list
 */
export declare const useCreateGroceryItem: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createGroceryItem>>, TError, {
        data: BodyType<CreateGroceryItemBody>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof createGroceryItem>>, TError, {
    data: BodyType<CreateGroceryItemBody>;
}, TContext>;
/**
 * @summary Update a grocery list item
 */
export declare const getUpdateGroceryItemUrl: (id: number) => string;
export declare const updateGroceryItem: (id: number, updateGroceryItemBody: UpdateGroceryItemBody, options?: RequestInit) => Promise<GroceryItem>;
export declare const getUpdateGroceryItemMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateGroceryItem>>, TError, {
        id: number;
        data: BodyType<UpdateGroceryItemBody>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof updateGroceryItem>>, TError, {
    id: number;
    data: BodyType<UpdateGroceryItemBody>;
}, TContext>;
export type UpdateGroceryItemMutationResult = NonNullable<Awaited<ReturnType<typeof updateGroceryItem>>>;
export type UpdateGroceryItemMutationBody = BodyType<UpdateGroceryItemBody>;
export type UpdateGroceryItemMutationError = ErrorType<unknown>;
/**
 * @summary Update a grocery list item
 */
export declare const useUpdateGroceryItem: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateGroceryItem>>, TError, {
        id: number;
        data: BodyType<UpdateGroceryItemBody>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof updateGroceryItem>>, TError, {
    id: number;
    data: BodyType<UpdateGroceryItemBody>;
}, TContext>;
/**
 * @summary Remove an item from the grocery list
 */
export declare const getDeleteGroceryItemUrl: (id: number) => string;
export declare const deleteGroceryItem: (id: number, options?: RequestInit) => Promise<void>;
export declare const getDeleteGroceryItemMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof deleteGroceryItem>>, TError, {
        id: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof deleteGroceryItem>>, TError, {
    id: number;
}, TContext>;
export type DeleteGroceryItemMutationResult = NonNullable<Awaited<ReturnType<typeof deleteGroceryItem>>>;
export type DeleteGroceryItemMutationError = ErrorType<unknown>;
/**
 * @summary Remove an item from the grocery list
 */
export declare const useDeleteGroceryItem: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof deleteGroceryItem>>, TError, {
        id: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof deleteGroceryItem>>, TError, {
    id: number;
}, TContext>;
/**
 * @summary Get food waste analytics
 */
export declare const getGetAnalyticsUrl: (params?: GetAnalyticsParams) => string;
export declare const getAnalytics: (params?: GetAnalyticsParams, options?: RequestInit) => Promise<Analytics>;
export declare const getGetAnalyticsQueryKey: (params?: GetAnalyticsParams) => readonly ["/api/analytics", ...GetAnalyticsParams[]];
export declare const getGetAnalyticsQueryOptions: <TData = Awaited<ReturnType<typeof getAnalytics>>, TError = ErrorType<unknown>>(params?: GetAnalyticsParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getAnalytics>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getAnalytics>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetAnalyticsQueryResult = NonNullable<Awaited<ReturnType<typeof getAnalytics>>>;
export type GetAnalyticsQueryError = ErrorType<unknown>;
/**
 * @summary Get food waste analytics
 */
export declare function useGetAnalytics<TData = Awaited<ReturnType<typeof getAnalytics>>, TError = ErrorType<unknown>>(params?: GetAnalyticsParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getAnalytics>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Get user profile
 */
export declare const getGetProfileUrl: () => string;
export declare const getProfile: (options?: RequestInit) => Promise<UserProfile>;
export declare const getGetProfileQueryKey: () => readonly ["/api/profile"];
export declare const getGetProfileQueryOptions: <TData = Awaited<ReturnType<typeof getProfile>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getProfile>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getProfile>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetProfileQueryResult = NonNullable<Awaited<ReturnType<typeof getProfile>>>;
export type GetProfileQueryError = ErrorType<unknown>;
/**
 * @summary Get user profile
 */
export declare function useGetProfile<TData = Awaited<ReturnType<typeof getProfile>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getProfile>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Update user profile
 */
export declare const getUpdateProfileUrl: () => string;
export declare const updateProfile: (updateProfileBody: UpdateProfileBody, options?: RequestInit) => Promise<UserProfile>;
export declare const getUpdateProfileMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateProfile>>, TError, {
        data: BodyType<UpdateProfileBody>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof updateProfile>>, TError, {
    data: BodyType<UpdateProfileBody>;
}, TContext>;
export type UpdateProfileMutationResult = NonNullable<Awaited<ReturnType<typeof updateProfile>>>;
export type UpdateProfileMutationBody = BodyType<UpdateProfileBody>;
export type UpdateProfileMutationError = ErrorType<unknown>;
/**
 * @summary Update user profile
 */
export declare const useUpdateProfile: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateProfile>>, TError, {
        data: BodyType<UpdateProfileBody>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof updateProfile>>, TError, {
    data: BodyType<UpdateProfileBody>;
}, TContext>;
/**
 * @summary Get ingredient substitution suggestions
 */
export declare const getGetSubstitutionsUrl: (params: GetSubstitutionsParams) => string;
export declare const getSubstitutions: (params: GetSubstitutionsParams, options?: RequestInit) => Promise<Substitution[]>;
export declare const getGetSubstitutionsQueryKey: (params?: GetSubstitutionsParams) => readonly ["/api/substitutions", ...GetSubstitutionsParams[]];
export declare const getGetSubstitutionsQueryOptions: <TData = Awaited<ReturnType<typeof getSubstitutions>>, TError = ErrorType<unknown>>(params: GetSubstitutionsParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getSubstitutions>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getSubstitutions>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetSubstitutionsQueryResult = NonNullable<Awaited<ReturnType<typeof getSubstitutions>>>;
export type GetSubstitutionsQueryError = ErrorType<unknown>;
/**
 * @summary Get ingredient substitution suggestions
 */
export declare function useGetSubstitutions<TData = Awaited<ReturnType<typeof getSubstitutions>>, TError = ErrorType<unknown>>(params: GetSubstitutionsParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getSubstitutions>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export {};
//# sourceMappingURL=api.d.ts.map