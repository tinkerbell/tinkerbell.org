import React from 'react';
import Layout from "../layouts/index"

const NotFoundPage = () => (
  <Layout hero={false}>
    <section className="section full-height">
      <div className="grid-container">
        <div className="grid-x grid-padding-x align-middle align-center">
          <div className="cell large-10 text-center">
            <h1>NOT FOUND</h1>
            <p>You just hit a route that doesn&#39;t exist... the sadness.</p>
          </div>
        </div>
      </div>
    </section>

  </Layout>
)

export default NotFoundPage;
