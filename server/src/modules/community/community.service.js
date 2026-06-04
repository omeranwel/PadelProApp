import prisma from '../../config/db.js';
import { formatDistanceToNow } from 'date-fns';

export const getPosts = async (tab = 'feed', userId = null) => {
  const where = {
    isActive: true
  };
  
  if (tab === 'forum') where.type = 'forum';
  if (tab === 'blog') where.type = 'blog';

  const posts = await prisma.post.findMany({
    where,
    include: {
      author: { select: { id: true, name: true, avatarUrl: true, skillLevel: true } },
      _count: { select: { replies: true } },
      postLikes: userId ? { where: { userId } } : false
    },
    orderBy: { createdAt: 'desc' }
  });

  return posts.map(p => ({
    id: p.id,
    type: p.type,
    title: p.title,
    content: p.content,
    category: p.category,
    coverUrl: p.coverUrl,
    author: p.author,
    likes: p.likes,
    isLiked: userId ? p.postLikes.length > 0 : false,
    comments: p._count.replies,
    createdAt: formatDistanceToNow(new Date(p.createdAt), { addSuffix: true }),
    tags: p.category ? [p.category] : []
  }));
};

export const createPost = async (authorId, data, coverFile) => {
  const { type, title, content, category } = data;
  
  return await prisma.post.create({
    data: {
      authorId,
      type: type || 'feed',
      title,
      content,
      category,
      coverUrl: coverFile?.path || null
    },
    include: {
      author: { select: { name: true, avatarUrl: true } }
    }
  });
};

export const toggleLike = async (postId, userId, action) => {
  const isLike = action === 'like';

  return await prisma.$transaction(async (tx) => {
    const existing = await tx.postLike.findUnique({
      where: {
        postId_userId: { postId, userId }
      }
    });

    if (isLike && !existing) {
      await tx.postLike.create({
        data: { postId, userId }
      });
      await tx.post.update({
        where: { id: postId },
        data: { likes: { increment: 1 } }
      });
    } else if (!isLike && existing) {
      await tx.postLike.delete({
        where: {
          postId_userId: { postId, userId }
        }
      });
      await tx.post.update({
        where: { id: postId },
        data: { likes: { decrement: 1 } }
      });
    }

    const post = await tx.post.findUnique({
      where: { id: postId },
      select: { likes: true }
    });

    return { success: true, likes: post.likes };
  });
};

export const getReplies = async (postId) => {
  const replies = await prisma.reply.findMany({
    where: { postId },
    include: {
      author: { select: { id: true, name: true, avatarUrl: true, skillLevel: true } }
    },
    orderBy: { createdAt: 'asc' }
  });

  return replies.map(r => ({
    ...r,
    createdAt: formatDistanceToNow(new Date(r.createdAt), { addSuffix: true })
  }));
};

export const createReply = async (authorId, postId, content) => {
  const reply = await prisma.reply.create({
    data: {
      authorId,
      postId,
      content
    },
    include: {
      author: { select: { name: true } },
      post: { select: { authorId: true, title: true } }
    }
  });

  // Notify post author
  if (reply.authorId !== reply.post.authorId) {
    await prisma.notification.create({
      data: {
        userId: reply.post.authorId,
        type: 'community',
        message: `${reply.author.name} replied to your post: "${reply.post.title || 'Untitled'}"`,
        link: `/community?id=${postId}`
      }
    });
  }

  return reply;
};
