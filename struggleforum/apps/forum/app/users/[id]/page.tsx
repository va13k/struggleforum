"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/src/features/auth/AuthProvider";
import { ApiError, apiFetch } from "@/src/lib/api-client";
import { apiRoutes } from "@/src/lib/api-routes";
import RelativeTime from "@/src/components/RelativeTime";
import type {
  CommentSummary,
  PostSummary,
  UserPublic,
  UserWithComments,
  UserWithPosts,
} from "@/src/lib/types";

type ProfileState =
  | { status: "loading" }
  | { status: "loaded"; profile: UserPublic }
  | { status: "not-found" }
  | { status: "error"; message: string };

type PostsTabState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "loaded"; posts: PostSummary[] }
  | { status: "error"; message: string };

type CommentsTabState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "loaded"; comments: CommentSummary[] }
  | { status: "error"; message: string };

export default function UserProfile() {
  const { id } = useParams<{ id: string }>();
  const { status: authStatus } = useAuth();

  const [profileState, setProfileState] = useState<ProfileState>({
    status: "loading",
  });
  const [activeTab, setActiveTab] = useState<"posts" | "comments">("posts");
  const [postsState, setPostsState] = useState<PostsTabState>({
    status: "idle",
  });
  const [commentsState, setCommentsState] = useState<CommentsTabState>({
    status: "idle",
  });

  useEffect(() => {
    let active = true;
    setProfileState({ status: "loading" });

    apiFetch<UserPublic>(apiRoutes.users.item(id))
      .then((profile) => {
        if (!active) return;
        setProfileState({ status: "loaded", profile });
      })
      .catch((err) => {
        if (!active) return;
        if (err instanceof ApiError && err.status === 404) {
          setProfileState({ status: "not-found" });
        } else {
          setProfileState({
            status: "error",
            message: err instanceof Error ? err.message : "Failed to load profile",
          });
        }
      });

    return () => {
      active = false;
    };
  }, [id]);

  const postsFetchedFor = useRef<string | null>(null);
  const commentsFetchedFor = useRef<string | null>(null);

  useEffect(() => {
    if (
      authStatus !== "authenticated" ||
      activeTab !== "posts" ||
      postsFetchedFor.current === id
    ) {
      return;
    }

    postsFetchedFor.current = id;
    let active = true;
    setPostsState({ status: "loading" });

    apiFetch<UserWithPosts>(`${apiRoutes.users.item(id)}?include=posts`)
      .then((data) => {
        if (!active) return;
        setPostsState({ status: "loaded", posts: data.posts });
      })
      .catch((err) => {
        if (!active) return;
        setPostsState({
          status: "error",
          message: err instanceof Error ? err.message : "Failed to load posts",
        });
      });

    return () => {
      active = false;
    };
  }, [activeTab, authStatus, id]);

  useEffect(() => {
    if (
      authStatus !== "authenticated" ||
      activeTab !== "comments" ||
      commentsFetchedFor.current === id
    ) {
      return;
    }

    commentsFetchedFor.current = id;
    let active = true;
    setCommentsState({ status: "loading" });

    apiFetch<UserWithComments>(`${apiRoutes.users.item(id)}?include=comments`)
      .then((data) => {
        if (!active) return;
        setCommentsState({ status: "loaded", comments: data.comments });
      })
      .catch((err) => {
        if (!active) return;
        setCommentsState({
          status: "error",
          message:
            err instanceof Error ? err.message : "Failed to load comments",
        });
      });

    return () => {
      active = false;
    };
  }, [activeTab, authStatus, id]);

  if (profileState.status === "loading") {
    return (
      <div className="flex flex-1 items-center justify-center px-4 py-10">
        <p className="text-white/60">Loading profile…</p>
      </div>
    );
  }

  if (profileState.status === "not-found") {
    return (
      <div className="flex flex-1 items-center justify-center px-4 py-10">
        <p className="text-white/80">This user does not exist.</p>
      </div>
    );
  }

  if (profileState.status === "error") {
    return (
      <div className="flex flex-1 items-center justify-center px-4 py-10">
        <p className="text-red-300">{profileState.message}</p>
      </div>
    );
  }

  const { profile } = profileState;

  return (
    <div className="flex flex-1 justify-center px-4 py-10 sm:px-6">
      <div className="w-full max-w-2xl">
        <div className="flex items-center gap-4 rounded-lg bg-slate-800/60 p-6 shadow-lg">
          {profile.avatarUrl && (
            // eslint-disable-next-line @next/next/no-img-element -- avatar URLs are arbitrary user-supplied domains, unknown ahead of time
            <img
              src={profile.avatarUrl}
              alt=""
              width={64}
              height={64}
              className="rounded-full object-cover"
            />
          )}
          <div>
            <h1 className="text-2xl font-bold text-white">
              {profile.username}
            </h1>
            <div className="mt-1 flex items-center gap-2 text-sm">
              <span
                className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                  profile.role === "ADMIN"
                    ? "bg-sky-500/20 text-sky-300"
                    : "bg-white/10 text-white/70"
                }`}
              >
                {profile.role}
              </span>
              <span className="text-white/50">
                Joined <RelativeTime dateTime={profile.createdAt} />
              </span>
            </div>
          </div>
        </div>

        <div className="mt-6 flex gap-2 border-b border-white/10">
          <button
            type="button"
            onClick={() => setActiveTab("posts")}
            className={`px-4 py-2 text-sm font-semibold transition-colors ${
              activeTab === "posts"
                ? "border-b-2 border-sky-400 text-sky-300"
                : "text-white/60 hover:text-white"
            }`}
          >
            Posts
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("comments")}
            className={`px-4 py-2 text-sm font-semibold transition-colors ${
              activeTab === "comments"
                ? "border-b-2 border-sky-400 text-sky-300"
                : "text-white/60 hover:text-white"
            }`}
          >
            Comments
          </button>
        </div>

        <div className="mt-4">
          {activeTab === "posts" ? (
            <PostsTab authStatus={authStatus} state={postsState} />
          ) : (
            <CommentsTab authStatus={authStatus} state={commentsState} />
          )}
        </div>
      </div>
    </div>
  );
}

function LoginPrompt({ what }: { what: string }) {
  return (
    <p className="text-white/70">
      <Link href="/login" className="text-sky-400 hover:underline">
        Log in
      </Link>{" "}
      to view this user&apos;s {what}.
    </p>
  );
}

function PostsTab({
  authStatus,
  state,
}: {
  authStatus: "loading" | "authenticated" | "unauthenticated";
  state: PostsTabState;
}) {
  if (authStatus !== "authenticated") {
    return <LoginPrompt what="posts" />;
  }
  if (state.status === "idle" || state.status === "loading") {
    return <p className="text-white/60">Loading posts…</p>;
  }
  if (state.status === "error") {
    return <p className="text-red-300">{state.message}</p>;
  }
  if (state.posts.length === 0) {
    return <p className="text-white/60">No posts yet.</p>;
  }

  return (
    <ul className="flex flex-col gap-3">
      {state.posts.map((post) => (
        <li
          key={post.id}
          className="rounded-md border border-white/10 bg-slate-900/40 p-3"
        >
          <Link
            href={`/posts/${post.id}`}
            className="font-semibold text-sky-300 hover:underline"
          >
            {post.title}
          </Link>
          <p className="mt-1 text-sm text-white/60">
            <RelativeTime dateTime={post.createdAt} />
            {post.locked && (
              <span className="ml-2 rounded bg-red-500/20 px-1.5 py-0.5 text-xs text-red-300">
                Locked
              </span>
            )}
          </p>
        </li>
      ))}
    </ul>
  );
}

function CommentsTab({
  authStatus,
  state,
}: {
  authStatus: "loading" | "authenticated" | "unauthenticated";
  state: CommentsTabState;
}) {
  if (authStatus !== "authenticated") {
    return <LoginPrompt what="comments" />;
  }
  if (state.status === "idle" || state.status === "loading") {
    return <p className="text-white/60">Loading comments…</p>;
  }
  if (state.status === "error") {
    return <p className="text-red-300">{state.message}</p>;
  }
  if (state.comments.length === 0) {
    return <p className="text-white/60">No comments yet.</p>;
  }

  return (
    <ul className="flex flex-col gap-3">
      {state.comments.map((comment) => (
        <li
          key={comment.id}
          className="rounded-md border border-white/10 bg-slate-900/40 p-3"
        >
          <Link
            href={`/posts/${comment.postId}`}
            className="text-sm text-sky-300 hover:underline"
          >
            View post
          </Link>
          <p className="mt-1 text-white/80">{comment.content}</p>
          <p className="mt-1 text-sm text-white/60">
            <RelativeTime dateTime={comment.createdAt} />
            {comment.locked && (
              <span className="ml-2 rounded bg-red-500/20 px-1.5 py-0.5 text-xs text-red-300">
                Locked
              </span>
            )}
          </p>
        </li>
      ))}
    </ul>
  );
}
