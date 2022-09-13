<template>
  <k-field class="pju-webhook" :class="{ monochrome: monochrome }" v-bind="$props">

    <WebhookStatus :status="status" :hookUpdated="hookUpdatedLive" :hookName="hook.name" :labels="labels" />

    <k-button class="pju-webhook--btn" icon="upload" type="submit" @click="triggerHook" :disabled="ctaDisabled">
      {{ statusCta }}
    </k-button>

  </k-field>

</template>

<script>
import WebhookStatus from './WebhookStatus.vue';
import { request } from '../helpers/request.js';

export default {
  inheritAttrs: false,
  components: {
    WebhookStatus
  },
  props: {
    statusInitial: Object,
    label: String,
    name: String,
    hook: {
      type: Object,
      required: true
    },
    endpoint: {
      type: String,
      required: true
    },
    siteModified: Number,
    hookUpdated: Number,
    labels: {
      type: Object,
      required: true
    },
    debug: Boolean,
    monochrome: Boolean
  },
  data() {
    return {
      statusLive: this.statusInitial,
      timer: null,
      hookUpdatedLive: this.hookUpdated,
      siteModifiedLive: this.siteModified
    }
  },
  computed: {
    statusCta() {
      if (!this.labels[this.status]) return 'Run now';

      return this.labels[this.status].cta;
    },
    ctaDisabled() {
      return ['hooksEmpty', 'hookNotfound', 'hookNoUrl'].includes(this.status);
    },
    status() {
      return (
        this.hook.showOutdated
        && !(this.statusLive === 'new')
        && this.siteModifiedLive > this.hookUpdatedLive
      )
        ? 'outdated'
        : this.statusLive
    }
  },
  methods: {
    async triggerHook() {
      const url = this.hook.url;
      const success = (http) => {
        const response = http.response ? JSON.parse(http.response) : null;

        this.log(`hook ${this.hook.name} started`);
        this.setStatus('success', response);
      };
      const error = (http) => {
        this.log(this.hook)
        this.setStatus('error', http.response);
        this.log('could not reach webhook URL', true);
      };
      this.setStatus('progress');
      request(url, this.hook.method, success, error, this.hook.payload, this.hook.headers);
    },
    setStatus(status, payload = null) {
      this.statusLive = status;
      this.updateTime();

      const url = `/${this.endpoint}/${this.hook.name}/${status}`;

      const success = (http) => this.log(http.response);
      const error = () => this.log('there was an error with updating the status :(', true);

      request(url, 'POST', success, error, payload);
    },
    updateTime() {
      // if we set the status to something else than success, we set the new time
      if (this.statusLive !== 'success') {
        this.hookUpdatedLive = Date.now() / 1000;
      }
    },
    log(message, error = false) {
      if (!this.debug) return;

      const logger = error ? console.warn : console.log;

      logger(message);
    }
  },
};
</script>

<style lang="scss">
.pju-webhook {
  .visuallyhidden {
    position: absolute;
    border: 0;
    clip: rect(0 0 0 0);
    clip-path: inset(50%);
    height: 1px;
    margin: -1px;
    overflow: hidden;
    padding: 0;
    width: 1px;
    white-space: nowrap;
  }
}

.pju-webhook--btn {
  display: block;
  color: #fff;
  background: #2d2f36;
  padding: 0.75em 1.5em 0.875em;
  border-radius: 6px;
}
</style>
