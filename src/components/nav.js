import React from 'react'
import { Link } from 'gatsby'
import tinkerbellLogo from '../images/tinkerbell-logo.png'

const Nav = ({ data }) => {
  return (
    <nav id="nav-main" className="nav">
      <div className="grid-container">
        <section className="grid-x grid-margin-x align-middle">
          <div className="cell large-2">
            <Link to="/">
              <img src={tinkerbellLogo} />
            </Link>
          </div>
          <div className="cell large-10">
            <ul>
              <li>
                <a href="https://github.com/tinkerbell/">Get Started on Github</a>
              </li>
              <li>
                <a href="https://slack.packet.net/">Slack Channel</a>
              </li>
              <li>
                <a href="https://twitter.com/tinkerbell_oss">Twitter</a>
              </li>
            </ul>
          </div>
        </section>
      </div>
    </nav>
  )
}

export default Nav
