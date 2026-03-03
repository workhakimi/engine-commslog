<template>
  <div class="gdm-comms" :style="cssVars">
    <div class="gdm-comms__shell" :style="shellStyles">

      <!-- Header -->
      <div class="gdm-comms__header">
        <div class="gdm-comms__header-left">
          <span class="gdm-comms__header-icon">💬</span>
          <h3 class="gdm-comms__header-title">{{ articleTitle }}</h3>
        </div>
        <div class="gdm-comms__header-right">
          <span v-if="isAdmin" class="gdm-comms__admin-badge">Admin</span>
          <span class="gdm-comms__count">{{ sortedComments.length }} comment{{ sortedComments.length !== 1 ? 's' : '' }}</span>
        </div>
      </div>

      <!-- Messages -->
      <div class="gdm-comms__messages" :style="{ maxHeight: props.content?.maxHeight || '420px' }">
        <div
          v-for="comm in sortedComments"
          :key="getF('id', comm)"
          class="gdm-comms__message"
          :style="messageStyles"
          :class="{ 'gdm-comms__message--own': isOwnMessage(comm), 'gdm-comms__message--preview': comm._p }"
          @click="handleCommentClick(comm)"
        >
          <!-- Avatar -->
          <div
            class="gdm-comms__avatar"
            :style="{ backgroundColor: avatarColor(getF('userId', comm)) }"
          >
            {{ getInitials(getUserName(comm)) }}
          </div>

          <!-- Body -->
          <div class="gdm-comms__msg-body">
            <div class="gdm-comms__msg-meta">
              <span class="gdm-comms__msg-author">{{ getUserName(comm) }}</span>
              <span v-if="isOwnMessage(comm)" class="gdm-comms__msg-you">you</span>
              <span class="gdm-comms__msg-date">{{ formatDate(getF('createdAt', comm)) }}</span>
            </div>
            <p class="gdm-comms__msg-text">{{ getF('message', comm) }}</p>
          </div>

          <!-- Admin: delete button -->
          <button
            v-if="isAdmin"
            type="button"
            class="gdm-comms__delete-btn"
            @click.stop="handleDelete(comm)"
            title="Delete comment"
          >
            ✕
          </button>
        </div>

        <!-- Empty state -->
        <div v-if="sortedComments.length === 0" class="gdm-comms__empty">
          <div class="gdm-comms__empty-icon">💭</div>
          <p class="gdm-comms__empty-text">No comments yet</p>
          <p class="gdm-comms__empty-sub">Be the first to add one below</p>
        </div>
      </div>

      <!-- Input area -->
      <div class="gdm-comms__compose">
        <div class="gdm-comms__compose-avatar" :style="{ backgroundColor: props.content?.accentColor || '#0d9488' }">
          {{ props.content?.currentUserId ? '✦' : '?' }}
        </div>
        <div class="gdm-comms__compose-input-wrap">
          <textarea
            v-model="newMessage"
            class="gdm-comms__compose-input"
            :style="inputStyles"
            :placeholder="placeholderLabel"
            rows="2"
            @keydown.enter.exact.prevent="handleSubmit"
          />
          <div class="gdm-comms__compose-hint">Press Enter to post · Shift+Enter for new line</div>
        </div>
        <button
          type="button"
          class="gdm-comms__post-btn"
          :disabled="!newMessage.trim()"
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

const NOW = Date.now();
const PREVIEW = [
  { id: 'p1', _p: true, user_id: 'u1', message: 'Thanks for the update — the new layout looks great! Much cleaner than before.', created_at: new Date(NOW - 3600000 * 5).toISOString(), cms_id: 'c1' },
  { id: 'p2', _p: true, user_id: 'u2', message: 'Quick question: will the API documentation be updated to reflect these changes too?', created_at: new Date(NOW - 3600000 * 3).toISOString(), cms_id: 'c1' },
  { id: 'p3', _p: true, user_id: 'u1', message: 'Yes, the API docs are being updated now — should be live by end of week.', created_at: new Date(NOW - 3600000 * 1).toISOString(), cms_id: 'c1' },
];

const AVATAR_COLORS = ['#0d9488', '#3b82f6', '#8b5cf6', '#f59e0b', '#10b981', '#ec4899', '#64748b'];
const colorForId = (id) => {
  if (!id) return '#64748b';
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) % AVATAR_COLORS.length;
  return AVATAR_COLORS[h];
};

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

    /* ─── Resolver ─── */
    const resolve = (formulaKey, item, fallbackKey) => {
      if (typeof wwLib !== 'undefined' && wwLib?.wwFormula?.useFormula) {
        const fn = wwLib.wwFormula.useFormula().resolveMappingFormula;
        const v = fn(props.content?.[formulaKey], item);
        if (v !== undefined && v !== null) return v;
      }
      return item[fallbackKey] ?? '';
    };

    /* ─── Field map ─── */
    const fieldMap = {
      id:        ['idFormula',        'id'],
      message:   ['messageFormula',   'message'],
      userId:    ['userIdFormula',     'user_id'],
      cmsId:     ['cmsIdFormula',      'cms_id'],
      createdAt: ['createdAtFormula',  'created_at'],
    };
    const getF = (field, item) => {
      const [fk, fb] = fieldMap[field] || [null, field];
      return fk ? resolve(fk, item, fb) : (item[fb] ?? '');
    };

    /* ─── Raw data ─── */
    const rawComments = computed(() => {
      const data = props.content?.commsData;
      if (!data) return [];
      const arr = typeof wwLib !== 'undefined' && wwLib?.wwUtils?.getDataFromCollection
        ? wwLib.wwUtils.getDataFromCollection(data)
        : data;
      return Array.isArray(arr) ? arr : [];
    });

    const usersMap = computed(() => {
      const data = props.content?.usersData;
      if (!data) return {};
      const arr = typeof wwLib !== 'undefined' && wwLib?.wwUtils?.getDataFromCollection
        ? wwLib.wwUtils.getDataFromCollection(data)
        : data;
      if (!Array.isArray(arr)) return {};
      const map = {};
      arr.forEach(u => {
        const id = u.userid ?? u.id;
        if (id) map[id] = u.contact_name ?? u.name ?? 'User';
      });
      return map;
    });

    const cmsItem = computed(() => {
      const item = props.content?.cmsItem;
      return item && typeof item === 'object' ? item : null;
    });

    /* ─── Display with preview fallback ─── */
    const displayComments = computed(() => {
      const items = rawComments.value;
      /* wwEditor:start */
      if (props.wwEditorState?.isEditing && items.length === 0) return PREVIEW;
      /* wwEditor:end */
      return items;
    });

    const sortedComments = computed(() => {
      return [...displayComments.value].sort((a, b) => {
        const da = getF('createdAt', a);
        const db = getF('createdAt', b);
        if (!da || !db) return 0;
        return new Date(da).getTime() - new Date(db).getTime();
      });
    });

    /* ─── View mode ─── */
    const isAdmin = computed(() => props.content?.viewMode !== 'client');

    /* ─── Helpers ─── */
    const getUserName = (item) => {
      const id = getF('userId', item);
      return id ? usersMap.value[id] || 'User' : 'User';
    };
    const getInitials = (name) => {
      if (!name || name === 'User') return '?';
      const parts = name.trim().split(/\s+/);
      if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
      return name.slice(0, 2).toUpperCase();
    };
    const isOwnMessage = (item) => {
      const uid = props.content?.currentUserId;
      return uid && getF('userId', item) === uid;
    };
    const avatarColor = (userId) => colorForId(userId);

    /* ─── Formatters ─── */
    const formatDate = (d) => {
      if (!d) return '';
      try {
        const date = new Date(d);
        if (isNaN(date.getTime())) return String(d);
        const diff = (Date.now() - date.getTime()) / 1000;
        if (diff < 60)   return 'just now';
        if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
        if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
        return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
      } catch { return String(d); }
    };

    /* ─── New message ─── */
    const newMessage = ref('');

    const handleSubmit = () => {
      /* wwEditor:start */
      if (props.wwEditorState?.isEditing) return;
      /* wwEditor:end */
      const msg = newMessage.value.trim();
      if (!msg) return;
      const cmsId = cmsItem.value?.id ?? null;
      const userId = props.content?.currentUserId || null;
      emit('trigger-event', { name: 'onAddComment', event: { value: { message: msg, cms_id: cmsId, user_id: userId } } });
      newMessage.value = '';
    };

    const handleDelete = (comm) => {
      /* wwEditor:start */
      if (props.wwEditorState?.isEditing) return;
      /* wwEditor:end */
      if (comm._p) return;
      emit('trigger-event', { name: 'onDeleteComment', event: { value: { id: comm.id, message: getF('message', comm) } } });
    };

    const handleCommentClick = (comm) => {
      /* wwEditor:start */
      if (props.wwEditorState?.isEditing) return;
      /* wwEditor:end */
      if (comm._p) return;
      emit('trigger-event', { name: 'onCommentClick', event: { value: { comment: comm } } });
    };

    /* ─── Labels ─── */
    const getText = (val, fb) => {
      if (typeof wwLib !== 'undefined' && wwLib?.wwLang?.getText) return wwLib.wwLang.getText(val) || fb;
      return val || fb;
    };
    const articleTitle   = computed(() => cmsItem.value?.title || getText(props.content?.articleTitleLabel, 'Discussion'));
    const placeholderLabel = computed(() => getText(props.content?.placeholderLabel, 'Add a comment…'));
    const submitLabel      = computed(() => getText(props.content?.submitButtonText, 'Post'));

    /* ─── Styles ─── */
    const cssVars = computed(() => ({
      fontFamily: props.content?.fontFamily || 'DM Sans, system-ui, sans-serif',
      fontSize: props.content?.fontSize || '15px',
      color: props.content?.textColor || '#1e293b',
      '--gdm-accent': props.content?.accentColor || '#0d9488',
      '--gdm-msg-bg': props.content?.messageBackgroundColor || '#ffffff',
      '--gdm-msg-border': props.content?.messageBorderColor || '#e2e8f0',
      '--gdm-input-bg': props.content?.inputBackgroundColor || '#ffffff',
      '--gdm-input-border': props.content?.inputBorderColor || '#e2e8f0',
      minHeight: '180px',
    }));
    const shellStyles = computed(() => ({
      backgroundColor: props.content?.backgroundColor || '#f8fafc',
      borderRadius: props.content?.borderRadius || '14px',
      border: `1px solid var(--gdm-msg-border)`,
    }));
    const messageStyles = computed(() => ({
      backgroundColor: 'var(--gdm-msg-bg)',
      borderColor: 'var(--gdm-msg-border)',
    }));
    const inputStyles = computed(() => ({
      backgroundColor: 'var(--gdm-input-bg)',
      borderColor: 'var(--gdm-input-border)',
      color: props.content?.textColor || '#1e293b',
    }));

    return {
      props,
      isAdmin,
      sortedComments,
      newMessage,
      articleTitle,
      placeholderLabel,
      submitLabel,
      cssVars,
      shellStyles,
      messageStyles,
      inputStyles,
      getF,
      getUserName,
      getInitials,
      isOwnMessage,
      avatarColor,
      formatDate,
      handleSubmit,
      handleDelete,
      handleCommentClick,
    };
  },
};
</script>

<style lang="scss" scoped>
.gdm-comms {
  width: 100%;
  box-sizing: border-box;
}

.gdm-comms__shell {
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* ── Header ── */
.gdm-comms__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.25rem;
  border-bottom: 1px solid var(--gdm-msg-border);
  gap: 0.75rem;
}
.gdm-comms__header-left {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex: 1;
  min-width: 0;
}
.gdm-comms__header-icon { font-size: 1.125rem; flex-shrink: 0; }
.gdm-comms__header-title {
  margin: 0;
  font-size: 1rem;
  font-weight: 700;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.gdm-comms__header-right {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-shrink: 0;
}
.gdm-comms__admin-badge {
  font-size: 0.6875rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--gdm-accent);
  background: color-mix(in srgb, var(--gdm-accent) 12%, transparent);
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
}
.gdm-comms__count {
  font-size: 0.75rem;
  color: #94a3b8;
  font-weight: 500;
}

/* ── Messages ── */
.gdm-comms__messages {
  overflow-y: auto;
  padding: 1rem 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.gdm-comms__message {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 0.875rem 1rem;
  border: 1px solid;
  border-radius: 10px;
  transition: box-shadow 0.15s;
  cursor: pointer;
  position: relative;
  &:hover { box-shadow: 0 2px 10px rgba(0,0,0,0.07); }
  &:hover .gdm-comms__delete-btn { opacity: 1; }
  &--own { border-color: color-mix(in srgb, var(--gdm-accent) 25%, transparent); }
  &--preview { opacity: 0.8; }
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
  font-weight: 700;
  color: #fff;
  letter-spacing: -0.02em;
}

.gdm-comms__msg-body {
  flex: 1;
  min-width: 0;
}
.gdm-comms__msg-meta {
  display: flex;
  align-items: baseline;
  gap: 0.375rem;
  margin-bottom: 0.3rem;
}
.gdm-comms__msg-author {
  font-size: 0.8125rem;
  font-weight: 700;
  color: #334155;
}
.gdm-comms__msg-you {
  font-size: 0.6875rem;
  font-weight: 600;
  color: var(--gdm-accent);
  background: color-mix(in srgb, var(--gdm-accent) 12%, transparent);
  padding: 0.1rem 0.35rem;
  border-radius: 3px;
}
.gdm-comms__msg-date {
  font-size: 0.75rem;
  color: #94a3b8;
}
.gdm-comms__msg-text {
  margin: 0;
  font-size: 0.9375rem;
  line-height: 1.55;
  color: #475569;
  white-space: pre-wrap;
  word-break: break-word;
}

.gdm-comms__delete-btn {
  position: absolute;
  top: 0.5rem;
  right: 0.625rem;
  opacity: 0;
  border: none;
  background: none;
  cursor: pointer;
  font-size: 0.625rem;
  color: #94a3b8;
  padding: 3px 5px;
  border-radius: 3px;
  transition: color 0.15s, background 0.15s, opacity 0.15s;
  &:hover { color: #ef4444; background: #fef2f2; opacity: 1; }
}

/* ── Empty state ── */
.gdm-comms__empty {
  padding: 2rem;
  text-align: center;
}
.gdm-comms__empty-icon { font-size: 2rem; margin-bottom: 0.5rem; }
.gdm-comms__empty-text { margin: 0 0 0.25rem; font-weight: 600; color: #475569; }
.gdm-comms__empty-sub { margin: 0; font-size: 0.8125rem; color: #94a3b8; }

/* ── Compose area ── */
.gdm-comms__compose {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 0.875rem 1.25rem;
  border-top: 1px solid var(--gdm-msg-border);
}

.gdm-comms__compose-avatar {
  flex-shrink: 0;
  width: 34px;
  height: 34px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 700;
  color: #fff;
  margin-top: 2px;
}

.gdm-comms__compose-input-wrap {
  flex: 1;
  min-width: 0;
}

.gdm-comms__compose-input {
  width: 100%;
  box-sizing: border-box;
  padding: 0.5rem 0.75rem;
  border: 1.5px solid var(--gdm-input-border);
  border-radius: 8px;
  font-size: inherit;
  font-family: inherit;
  background-color: var(--gdm-input-bg);
  resize: none;
  outline: none;
  transition: border-color 0.15s, box-shadow 0.15s;
  &:focus {
    border-color: var(--gdm-accent);
    box-shadow: 0 0 0 3px color-mix(in srgb, var(--gdm-accent) 18%, transparent);
  }
  &::placeholder { color: #94a3b8; }
}

.gdm-comms__compose-hint {
  font-size: 0.6875rem;
  color: #94a3b8;
  margin-top: 0.25rem;
}

.gdm-comms__post-btn {
  flex-shrink: 0;
  margin-top: 2px;
  padding: 0.5rem 1.125rem;
  background: var(--gdm-accent);
  color: #fff;
  border: none;
  border-radius: 7px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.15s, transform 0.1s;
  &:hover:not(:disabled) { opacity: 0.88; }
  &:active:not(:disabled) { transform: scale(0.97); }
  &:disabled { opacity: 0.45; cursor: not-allowed; }
}
</style>
