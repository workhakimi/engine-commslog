<template>
  <div class="gdm-comms" :style="wrapperStyles">
    <div class="gdm-comms__container" :style="containerStyles">
      <!-- Article header -->
      <div class="gdm-comms__header">
        <h3 class="gdm-comms__article-title" :style="{ color: content?.textColor || '#1e293b' }">
          {{ articleTitle }}
        </h3>
      </div>

      <!-- Messages list -->
      <div class="gdm-comms__messages">
        <div
          v-for="comm in sortedComments"
          :key="getCommentId(comm)"
          class="gdm-comms__message"
          :style="messageStyles"
          :class="{ 'gdm-comms__message--disabled': content?.disableInteractions }"
          @click="handleCommentClick(comm)"
        >
          <div
            class="gdm-comms__avatar"
            :style="{ backgroundColor: content?.avatarBackgroundColor || '#0d9488' }"
          >
            {{ getInitials(getUserName(comm)) }}
          </div>
          <div class="gdm-comms__message-body">
            <div class="gdm-comms__message-meta">
              <span class="gdm-comms__message-author">{{ getUserName(comm) }}</span>
              <span class="gdm-comms__message-date">{{ formatDate(getCreatedAt(comm)) }}</span>
            </div>
            <div class="gdm-comms__message-text">{{ getMessage(comm) }}</div>
          </div>
        </div>
        <div v-if="sortedComments.length === 0" class="gdm-comms__empty">
          No comments yet. Be the first to add one.
        </div>
      </div>

      <!-- Add comment -->
      <div class="gdm-comms__input-area">
        <textarea
          v-model="newMessage"
          class="gdm-comms__input"
          :style="inputStyles"
          :placeholder="placeholderLabel"
          rows="3"
          :disabled="content?.disableInteractions"
          @keydown.enter.exact.prevent="handleSubmit"
        />
        <button
          type="button"
          class="gdm-comms__submit"
          :style="submitButtonStyles"
          :disabled="content?.disableInteractions || !newMessage.trim()"
          @click="handleSubmit"
        >
          {{ submitLabel }}
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue';

export default {
  name: 'GdmCommsLog',
  props: {
    content: { type: Object, required: true },
    uid: { type: String, required: true },
    /* wwEditor:start */
    wwEditorState: { type: Object, required: true },
    /* wwEditor:end */
  },
  emits: ['trigger-event'],
  setup(props, { emit }) {
    const resolveMappingFormula =
      typeof wwLib !== 'undefined' && wwLib?.wwFormula?.useFormula
        ? wwLib.wwFormula.useFormula().resolveMappingFormula
        : () => undefined;

    const newMessage = ref('');

    const commentsList = computed(() => {
      const data = props.content?.commsData;
      if (!data) return [];
      const arr = typeof wwLib !== 'undefined' && wwLib?.wwUtils?.getDataFromCollection
        ? wwLib.wwUtils.getDataFromCollection(data)
        : props.content?.commsData;
      return Array.isArray(arr) ? arr : [];
    });

    const cmsItem = computed(() => {
      const item = props.content?.cmsItem;
      return item && typeof item === 'object' ? item : null;
    });

    const usersMap = computed(() => {
      const data = props.content?.usersData;
      if (!data) return {};
      const arr = typeof wwLib !== 'undefined' && wwLib?.wwUtils?.getDataFromCollection
        ? wwLib.wwUtils.getDataFromCollection(data)
        : props.content?.usersData;
      if (!Array.isArray(arr)) return {};
      const map = {};
      arr.forEach((u) => {
        const id = u.userid ?? u.id;
        if (id) map[id] = u.contact_name ?? u.name ?? 'User';
      });
      return map;
    });

    const sortedComments = computed(() => {
      const list = [...commentsList.value];
      list.sort((a, b) => {
        const da = getCreatedAt(a);
        const db = getCreatedAt(b);
        if (!da || !db) return 0;
        return new Date(da).getTime() - new Date(db).getTime();
      });
      return list;
    });

    const getCommentId = (item) =>
      resolveMappingFormula(props.content?.idFormula, item) ?? item.id ?? '';

    const getMessage = (item) =>
      resolveMappingFormula(props.content?.messageFormula, item) ?? item.message ?? '';

    const getUserId = (item) =>
      resolveMappingFormula(props.content?.userIdFormula, item) ?? item.user_id ?? '';

    const getCmsId = (item) =>
      resolveMappingFormula(props.content?.cmsIdFormula, item) ?? item.cms_id ?? '';

    const getCreatedAt = (item) =>
      resolveMappingFormula(props.content?.createdAtFormula, item) ?? item.created_at ?? '';

    const getUserName = (item) => {
      const id = getUserId(item);
      return id ? usersMap.value[id] || 'User' : 'User';
    };

    const getInitials = (name) => {
      if (!name || name === 'User') return '?';
      const parts = name.trim().split(/\s+/);
      if (parts.length >= 2) {
        return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
      }
      return name.slice(0, 2).toUpperCase();
    };

    const formatDate = (d) => {
      if (!d) return '';
      try {
        const date = typeof d === 'string' ? new Date(d) : d;
        return isNaN(date.getTime()) ? String(d) : date.toLocaleString(undefined, {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        });
      } catch {
        return String(d);
      }
    };

    const getCmsIdFromItem = () => {
      const item = cmsItem.value;
      return item?.id ?? null;
    };

    const handleSubmit = () => {
      /* wwEditor:start */
      if (props.wwEditorState?.isEditing || props.content?.disableInteractions) return;
      /* wwEditor:end */
      if (props.content?.disableInteractions) return;

      const msg = newMessage.value?.trim();
      if (!msg) return;

      const cmsId = getCmsIdFromItem();
      const userId = props.content?.currentUserId ?? '';

      emit('trigger-event', {
        name: 'onAddComment',
        event: {
          value: {
            message: msg,
            cms_id: cmsId,
            user_id: userId || null,
          },
        },
      });

      newMessage.value = '';
    };

    const handleCommentClick = (comment) => {
      /* wwEditor:start */
      if (props.wwEditorState?.isEditing || props.content?.disableInteractions) return;
      /* wwEditor:end */
      if (props.content?.disableInteractions) return;
      emit('trigger-event', { name: 'onCommentClick', event: { value: { comment } } });
    };

    const articleTitle = computed(() => {
      const label = typeof wwLib !== 'undefined' && wwLib?.wwLang?.getText
        ? wwLib.wwLang.getText(props.content?.articleTitleLabel)
        : props.content?.articleTitleLabel;
      const item = cmsItem.value;
      const title = item?.title ?? item?.name;
      return title || label || 'Discussion';
    });

    const placeholderLabel = computed(() => {
      if (typeof wwLib !== 'undefined' && wwLib?.wwLang?.getText) {
        return wwLib.wwLang.getText(props.content?.placeholderLabel) || 'Add a comment...';
      }
      return props.content?.placeholderLabel || 'Add a comment...';
    });

    const submitLabel = computed(() => {
      if (typeof wwLib !== 'undefined' && wwLib?.wwLang?.getText) {
        return wwLib.wwLang.getText(props.content?.submitButtonText) || 'Post';
      }
      return props.content?.submitButtonText || 'Post';
    });

    const wrapperStyles = computed(() => ({
      fontFamily: props.content?.fontFamily || 'DM Sans, system-ui, sans-serif',
      fontSize: props.content?.fontSize || '15px',
      color: props.content?.textColor || '#1e293b',
    }));

    const containerStyles = computed(() => ({
      backgroundColor: props.content?.backgroundColor || '#f8fafc',
      borderRadius: props.content?.borderRadius || '12px',
      padding: props.content?.padding || '20px',
      border: `1px solid ${props.content?.messageBorderColor || '#e2e8f0'}`,
    }));

    const messageStyles = computed(() => ({
      backgroundColor: props.content?.messageBackgroundColor || '#ffffff',
      borderColor: props.content?.messageBorderColor || '#e2e8f0',
    }));

    const inputStyles = computed(() => ({
      backgroundColor: props.content?.inputBackgroundColor || '#ffffff',
      borderColor: props.content?.inputBorderColor || '#e2e8f0',
      color: props.content?.textColor || '#1e293b',
      '--focus-color': props.content?.inputFocusColor || '#0d9488',
    }));

    const submitButtonStyles = computed(() => ({
      backgroundColor: props.content?.inputFocusColor || '#0d9488',
      color: '#ffffff',
    }));

    return {
      content: computed(() => props.content),
      newMessage,
      sortedComments,
      articleTitle,
      placeholderLabel,
      submitLabel,
      wrapperStyles,
      containerStyles,
      messageStyles,
      inputStyles,
      submitButtonStyles,
      getCommentId,
      getMessage,
      getUserId,
      getCmsId,
      getCreatedAt,
      getUserName,
      getInitials,
      formatDate,
      handleSubmit,
      handleCommentClick,
    };
  },
};
</script>

<style lang="scss" scoped>
.gdm-comms {
  width: 100%;
  max-width: 640px;
}

.gdm-comms__container {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.gdm-comms__header {
  padding-bottom: 0.75rem;
  border-bottom: 1px solid #e2e8f0;
}

.gdm-comms__article-title {
  margin: 0;
  font-size: 1.125rem;
  font-weight: 600;
  line-height: 1.3;
}

.gdm-comms__messages {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  max-height: 400px;
  overflow-y: auto;
}

.gdm-comms__message {
  display: flex;
  gap: 0.75rem;
  padding: 0.875rem 1rem;
  border: 1px solid;
  border-radius: 8px;
  cursor: pointer;
  transition: box-shadow 0.2s;

  &:hover:not(.gdm-comms__message--disabled) {
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  }

  &--disabled {
    cursor: default;
  }
}

.gdm-comms__avatar {
  flex-shrink: 0;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8125rem;
  font-weight: 600;
  color: #fff;
}

.gdm-comms__message-body {
  flex: 1;
  min-width: 0;
}

.gdm-comms__message-meta {
  display: flex;
  align-items: baseline;
  gap: 0.5rem;
  margin-bottom: 0.25rem;
}

.gdm-comms__message-author {
  font-size: 0.8125rem;
  font-weight: 600;
  color: #334155;
}

.gdm-comms__message-date {
  font-size: 0.75rem;
  color: #94a3b8;
}

.gdm-comms__message-text {
  font-size: 0.9375rem;
  line-height: 1.5;
  color: #475569;
  white-space: pre-wrap;
  word-break: break-word;
}

.gdm-comms__empty {
  font-size: 0.875rem;
  color: #94a3b8;
  font-style: italic;
  padding: 1.5rem;
  text-align: center;
}

.gdm-comms__input-area {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding-top: 0.75rem;
  border-top: 1px solid #e2e8f0;
}

.gdm-comms__input {
  width: 100%;
  padding: 0.625rem 0.75rem;
  border: 1px solid;
  border-radius: 8px;
  font-size: inherit;
  font-family: inherit;
  resize: vertical;
  min-height: 72px;
  transition: border-color 0.2s, box-shadow 0.2s;

  &:focus {
    outline: none;
    border-color: var(--focus-color);
    box-shadow: 0 0 0 2px rgba(13, 148, 136, 0.15);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  &::placeholder {
    color: #94a3b8;
  }
}

.gdm-comms__submit {
  align-self: flex-end;
  padding: 0.5rem 1.25rem;
  border: none;
  border-radius: 6px;
  font-size: 0.9375rem;
  font-weight: 500;
  cursor: pointer;
  transition: opacity 0.2s;

  &:hover:not(:disabled) {
    opacity: 0.9;
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }
}
</style>
