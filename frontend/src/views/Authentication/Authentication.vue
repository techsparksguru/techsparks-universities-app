<template>
  <div class="auth">
    <div v-if="tab === 'login'">
      <div class="text-center">
        <div class="mb-5">
          <h1>
            Good
            {{ hours < 12 ? "Morning" : hours < 18 ? "Afternoon" : "Evening" }}!
            Welcome Back
          </h1>
          <p>Enter Your details below</p>
        </div>
        <a-form-item
          :label-col="{ span: 24 }"
          :wrapper-col="{ span: 24 }"
          :label="showLable ? 'Email' : ''"
          :validate-status="errors.email ? 'error' : ''"
          :help="errors.email"
        >
          <a-input
            type="text"
            size="large"
            placeholder="Work email"
            v-model="payload.email"
            @keyup.enter="login"
            v-bind:disabled="is_loading"
          ></a-input>
        </a-form-item>
        <a-form-item
          :label-col="{ span: 24 }"
          :wrapper-col="{ span: 24 }"
          :label="showLable ? 'Password' : ''"
          :validate-status="errors.password ? 'error' : ''"
          :help="errors.password"
        >
          <a-input
            type="password"
            size="large"
            placeholder="your strong password"
            v-model="payload.password"
            @keyup.enter="login"
            v-bind:disabled="is_loading"
          ></a-input>
        </a-form-item>
        <template v-if="config.USE_CAPTCHA">
          <vue-recaptcha ref="recaptcha" @verify="onCaptchaVerified" @expired="onCaptchaExpired"
            :sitekey="config.CAPTCHA_SITEKEY" :loadRecaptchaScript="true"></vue-recaptcha>
          <a-input hidden class="captcha-hidden-input" v-model="payload.captcha" label="captcha">
          </a-input>
          <div class="has-error pb-3"><div class="ant-form-explain" v-if="errors.captcha">{{errors.captcha}}</div></div>
        </template>
        <a-button
          type="primary"
          :loading="is_loading"
          size="large"
          v-on:click="login"
          class="mb-4 w-100 shadow-2"
          >Sign in</a-button
        >
        <p class="mb-2 text-muted">
          Forgot password?
          <a @click="changeTab('resetPassword')">Reset</a>
        </p>
        <!-- <p class="mb-0 text-muted">
          Don’t have an account?
          <a @click="changeTab('signup')">Sign up</a>
        </p> -->
      </div>
    </div>
    <div v-if="tab === 'signup'">
      <div class="text-center">
        <div class="mb-5">
          <h3>Signup for the most advanced ATS</h3>
          <p>Enter Your details below</p>
        </div>
        <a-row :gutter="12">
          <a-col :span="12">
            <a-form-item
              :label-col="{ span: 24 }"
              :wrapper-col="{ span: 24 }"
              :label="showLable ? 'First name' : ''"
              :validate-status="errors.first_name ? 'error' : ''"
              :help="errors.first_name"
            >
              <a-input
                type="text"
                size="large"
                placeholder="First name"
                v-model="payload.first_name"
                @keyup.enter="signup"
                v-bind:disabled="is_loading"
              ></a-input>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item
              :label-col="{ span: 24 }"
              :wrapper-col="{ span: 24 }"
              :label="showLable ? 'Last name' : ''"
              :validate-status="errors.last_name ? 'error' : ''"
              :help="errors.last_name"
            >
              <a-input
                type="text"
                size="large"
                placeholder="Last name"
                v-model="payload.last_name"
                @keyup.enter="signup"
                v-bind:disabled="is_loading"
              ></a-input>
            </a-form-item>
          </a-col>
        </a-row>
        <a-form-item
          :label-col="{ span: 24 }"
          :wrapper-col="{ span: 24 }"
          :label="showLable ? 'Email' : ''"
          :validate-status="errors.email ? 'error' : ''"
          :help="errors.email"
        >
          <a-input
            type="text"
            size="large"
            placeholder="Work email"
            v-model="payload.email"
            @keyup.enter="signup"
            v-bind:disabled="is_loading"
          ></a-input>
        </a-form-item>
        <a-form-item
          :label-col="{ span: 24 }"
          :wrapper-col="{ span: 24 }"
          :label="showLable ? 'Company' : ''"
          :validate-status="errors.company_name ? 'error' : ''"
          :help="errors.company_name"
        >
          <a-input
            type="text"
            size="large"
            placeholder="Company"
            v-model="payload.company_name"
            @keyup.enter="signup"
            v-bind:disabled="is_loading"
          ></a-input>
        </a-form-item>
        <template v-if="config.USE_CAPTCHA">
          <vue-recaptcha ref="recaptcha" @verify="onCaptchaVerified" @expired="onCaptchaExpired"
            :sitekey="config.CAPTCHA_SITEKEY" :loadRecaptchaScript="true"></vue-recaptcha>
          <a-input hidden class="captcha-hidden-input" v-model="payload.captcha" label="captcha">
          </a-input>
          <div class="has-error pb-3"><div class="ant-form-explain" v-if="errors.captcha">{{errors.captcha}}</div></div>
        </template>
        <a-form-item
          :label-col="{ span: 24 }"
          :wrapper-col="{ span: 24 }"
          :label="showLable ? '' : ''"
          :validate-status="errors.agreed ? 'error' : ''"
          :help="errors.agreed"
        >
          <a-checkbox v-model="agreed">
            I agree to
            <a-button class="p-0" type="link" @click="tvisible = true"
              >Terms and Conditions</a-button
            >
          </a-checkbox>
          <a-modal
            title="Terms and conditions"
            v-model="tvisible"
            @ok="
              agreed = true;
              tvisible = false;
            "
          >
            <div class="tandc">
              <h2>Universities app Terms and Conditions of Use</h2>
              <h3>1. Terms</h3>
              <p>
                By accessing this web site, you are agreeing to be bound by
                these web site Terms and Conditions of Use, all applicable laws
                and regulations, and agree that you are responsible for
                compliance with any applicable local laws. If you do not agree
                with any of these terms, you are prohibited from using or
                accessing this site. The materials contained in this web site
                are protected by applicable copyright and trade mark law.
              </p>
              <h3>2. Use License</h3>
              <ol type="a">
                <li>
                  Permission is granted to temporarily download one copy of the
                  materials (information or software) on HTML5-Editor.net's web
                  site for personal, non-commercial transitory viewing only.
                  This is the grant of a license, not a transfer of title, and
                  under this license you may not:
                  <ol type="i">
                    <li>modify or copy the materials;</li>
                    <li>
                      use the materials for any commercial purpose, or for any
                      public display (commercial or non-commercial);
                    </li>
                    <li>
                      attempt to decompile or reverse engineer any software
                      contained on HTML5-Editor.net's web site;
                    </li>
                    <li>
                      remove any copyright or other proprietary notations from
                      the materials; or
                    </li>
                    <li>
                      transfer the materials to another person or "mirror" the
                      materials on any other server.
                    </li>
                  </ol>
                </li>
                <li>
                  This license shall automatically terminate if you violate any
                  of these restrictions and may be terminated by
                  HTML5-Editor.net at any time. Upon terminating your viewing of
                  these materials or upon the termination of this license, you
                  must destroy any downloaded materials in your possession
                  whether in electronic or printed format.
                </li>
              </ol>
              <h3>3. Disclaimer</h3>
              <ol type="a">
                <li>
                  The materials on HTML5-Editor.net's web site are provided "as
                  is". HTML5-Editor.net makes no warranties, expressed or
                  implied, and hereby disclaims and negates all other
                  warranties, including without limitation, implied warranties
                  or conditions of merchantability, fitness for a particular
                  purpose, or non-infringement of intellectual property or other
                  violation of rights. Further, HTML5-Editor.net does not
                  warrant or make any representations concerning the accuracy,
                  likely results, or reliability of the use of the materials on
                  its Internet web site or otherwise relating to such materials
                  or on any sites linked to this site.
                </li>
              </ol>
              <h3>4. Limitations</h3>
              <p>
                In no event shall HTML5-Editor.net or its suppliers be liable
                for any damages (including, without limitation, damages for loss
                of data or profit, or due to business interruption,) arising out
                of the use or inability to use the materials on
                HTML5-Editor.net's Internet site, even if HTML5-Editor.net or a
                HTML5-Editor.net authorized representative has been notified
                orally or in writing of the possibility of such damage. Because
                some jurisdictions do not allow limitations on implied
                warranties, or limitations of liability for consequential or
                incidental damages, these limitations may not apply to you.
              </p>
              <h3>5. Revisions and Errata</h3>
              <p>
                The materials appearing on HTML5-Editor.net's web site could
                include technical, typographical, or photographic errors.
                HTML5-Editor.net does not warrant that any of the materials on
                its web site are accurate, complete, or current.
                HTML5-Editor.net may make changes to the materials contained on
                its web site at any time without notice. HTML5-Editor.net does
                not, however, make any commitment to update the materials.
              </p>
              <h3>6. Links</h3>
              <p>
                HTML5-Editor.net has not reviewed all of the sites linked to its
                Internet web site and is not responsible for the contents of any
                such linked site. The inclusion of any link does not imply
                endorsement by HTML5-Editor.net of the site. Use of any such
                linked web site is at the user's own risk.
              </p>
              <h3>7. Site Terms of Use Modifications</h3>
              <p>
                HTML5-Editor.net may revise these terms of use for its web site
                at any time without notice. By using this web site you are
                agreeing to be bound by the then current version of these Terms
                and Conditions of Use.
              </p>
              <h3>8. Governing Law</h3>
              <p>
                Any claim relating to HTML5-Editor.net's web site shall be
                governed by the laws of the State of United Kingdom without
                regard to its conflict of law provisions.
              </p>
              <p>
                General Terms and Conditions applicable to Use of a Web Site.
              </p>
              <h2>Privacy Policy</h2>
              <p>
                Your privacy is very important to us. Accordingly, we have
                developed this Policy in order for you to understand how we
                collect, use, communicate and disclose and make use of personal
                information.
              </p>
              <p>
                <strong>
                  <a href="/">Our HTML editor</a> is not collecting personal
                  data but we do use third party applications that may do so.
                  Please check their Privacy Policies to learn about them:
                  Google Analytics, Google Adsense, Gmail, Facebook, Youtube. We
                  might add or remove thrid party applications to the website at
                  any time without any notice. Please check the source code of
                  the website or use browser plugins to identify them.
                </strong>
              </p>
              <p>The following outlines our privacy policy.</p>
              <ul>
                <li>
                  Before or at the time of collecting personal information, we
                  will identify the purposes for which information is being
                  collected.
                </li>
                <li>
                  We will collect and use of personal information solely with
                  the objective of fulfilling those purposes specified by us and
                  for other compatible purposes, unless we obtain the consent of
                  the individual concerned or as required by law.
                </li>
                <li>
                  We will only retain personal information as long as necessary
                  for the fulfillment of those purposes.
                </li>
                <li>
                  We will collect personal information by lawful and fair means
                  and, where appropriate, with the knowledge or consent of the
                  individual concerned.
                </li>
                <li>
                  Personal data should be relevant to the purposes for which it
                  is to be used, and, to the extent necessary for those
                  purposes, should be accurate, complete, and up-to-date.
                </li>
                <li>
                  We will protect personal information by reasonable security
                  safeguards against loss or theft, as well as unauthorized
                  access, disclosure, copying, use or modification.
                </li>
                <li>
                  We will make readily available to customers information about
                  our policies and practices relating to the management of
                  personal information.
                </li>
              </ul>
              <p>
                We are committed to conducting our business in accordance with
                these principles in order to ensure that the confidentiality of
                personal information is protected and maintained.
              </p>
            </div>
          </a-modal>
        </a-form-item>
        <a-button
          type="primary"
          :loading="is_loading"
          size="large"
          v-on:click="signup"
          class="mb-4 w-100 shadow-2"
          >Sign up</a-button
        >
        <p class="mb-0 text-muted">
          Already have an account ?
          <a @click="changeTab('login')">Sign in</a>
        </p>
      </div>
    </div>
    <div class="card" v-if="tab === 'resetPassword'">
      <div class="card-body text-center">
        <div class="mb-4">
          <h1>Did you forgot your password?</h1>
          <p>Enter Your email address you're using for your account below</p>
        </div>
        <a-form-item
          :label-col="{ span: 24 }"
          :wrapper-col="{ span: 24 }"
          :label="showLable ? 'Email' : ''"
          :validate-status="errors.email ? 'error' : ''"
          :help="errors.email"
        >
          <a-input
            size="large"
            placeholder="Work email"
            v-model="payload.email"
            @keyup.enter="resetPassword"
            v-bind:disabled="is_loading"
          ></a-input>
        </a-form-item>
        <a-button
          type="primary"
          :loading="is_loading"
          size="large"
          v-on:click="resetPassword"
          class="mb-4 w-100 shadow-2"
          >Reset Password</a-button
        >
        <!-- <p class="mb-0 text-muted">
          Don’t have an account?
          <a @click="changeTab('signup')">Sign up</a>
        </p> -->
        <p class="mb-0 text-muted">
          Back to login
          <a @click="changeTab('login')"> Sign in</a>
        </p>
      </div>
    </div>
  </div>
</template>
<script src="./Authentication.js"></script>
<style src="./Authentication.css" scoped></style>
