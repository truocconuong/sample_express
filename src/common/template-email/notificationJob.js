const slug = require('slug');
const _ = require('lodash');

slug.charmap['/'] = '-';

const itemJobHtml = (job) => {
  let atributeTags = '';
  _.map(job.Tags, (tag) => {
    atributeTags += `<div class="tag-item" style="background:${tag.background};">${tag.title}</div>`;
    return tag;
  });
  return (
    ` <div style="padding-top:7px;">
      <tr>
      <td style="padding: 20px;border-bottom: 0.5px solid hsl(0, 0%, 90%);box-shadow: rgba(149, 157, 165, 0.2) 0px 8px 24px;margin-top:7px;" valign="top">
          <a style="text-decoration: none;" href="${process.env.SITE_VN_FETCH_TECH}/careers/${slug(job.title)}-${job.id}"> 
          <table border="0" cellpadding="0" cellspacing="0"
              width="100%" role="presentation">
              <tbody>
                  <tr>
                      <td valign="middle">
                          <table border="0" cellpadding="0"
                              cellspacing="0" width="100%"
                              role="presentation">
                              <tbody>
                                  <tr>
                                      <td style="display: flex;line-height: 24px; display:-webkit-flex;font-family: 'Fira Sans', Helvetica, Arial, sans-serif; font-size: 16px; font-weight: 500; letter-spacing: -0.1px; color: #1B1B1B; -webkit-align-content: center;" class="pc-fb-font"
                                          valign="top">
                                          <div style="width: 70%;padding-top: 5px;">
                                          <a  style="font-size:16px;font-weight: bold;text-decoration: none; color: #1B1B1B;">${job.title} (${job.salary})</a>
                                          <div style="display :flex;font-weight: bold;color: #ffffff;" class="job-tag">
                                          ${atributeTags}
                                          </div>
                                          </div>
                                          <div class="btn-refer">
                                              <div>Refer Now</div>
                                          </div>
                                      </td>
                                  </tr>
                              </tbody>
                          </table>
                      </td>
                  </tr>
              </tbody>
          </table>
          </a>
      </td>
     </tr>
      </div>
    `
  );
};
const templateJob = (name, jobs) => {
  let jobItems = '';
  // eslint-disable-next-line no-restricted-syntax
  for (const job of jobs) {
    jobItems += itemJobHtml(job);
  }
  return (
    `<!DOCTYPE html
    PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
  <html xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml"
    xmlns:o="urn:schemas-microsoft-com:office:office">
  
  <head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
    <!--[if !mso]><!-->
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <!--<![endif]-->
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="format-detection" content="telephone=no">
    <meta name="x-apple-disable-message-reformatting">
    <title></title>
    <style type="text/css">
    .btn-refer {
      padding: 9px;
      margin: 7px;
      background-color: #15bcc5;
      color: white;
      text-align: center;
      font-weight: bold;
      cursor: pointer;
      margin-left: auto;
      width: 86px;
      height: 23px;
    }
      @media screen {
        @font-face {
          font-family: 'Fira Sans';
          font-style: normal;
          font-weight: 300;
          src: local(''),
            url('https://fonts.gstatic.com/s/firasans/v10/va9B4kDNxMZdWfMOD5VnPKruRA.woff2') format('woff2'),
            url('https://fonts.gstatic.com/s/firasans/v10/va9B4kDNxMZdWfMOD5VnPKruQg.woff') format('woff');
        }
  
        @font-face {
          font-family: 'Fira Sans';
          font-style: normal;
          font-weight: 400;
          src: local(''),
            url('https://fonts.gstatic.com/s/firasans/v10/va9E4kDNxMZdWfMOD5VflQ.woff2') format('woff2'),
            url('https://fonts.gstatic.com/s/firasans/v10/va9E4kDNxMZdWfMOD5Vfkw.woff') format('woff');
        }
  
        @font-face {
          font-family: 'Fira Sans';
          font-style: normal;
          font-weight: 500;
          src: local(''),
            url('https://fonts.gstatic.com/s/firasans/v10/va9B4kDNxMZdWfMOD5VnZKvuRA.woff2') format('woff2'),
            url('https://fonts.gstatic.com/s/firasans/v10/va9B4kDNxMZdWfMOD5VnZKvuQg.woff') format('woff');
        }
  
        @font-face {
          font-family: 'Fira Sans';
          font-style: normal;
          font-weight: 700;
          src: local(''),
            url('https://fonts.gstatic.com/s/firasans/v10/va9B4kDNxMZdWfMOD5VnLK3uRA.woff2') format('woff2'),
            url('https://fonts.gstatic.com/s/firasans/v10/va9B4kDNxMZdWfMOD5VnLK3uQg.woff') format('woff');
        }
  
        @font-face {
          font-family: 'Fira Sans';
          font-style: normal;
          font-weight: 800;
          src: local(''),
            url('https://fonts.gstatic.com/s/firasans/v10/va9B4kDNxMZdWfMOD5VnMK7uRA.woff2') format('woff2'),
            url('https://fonts.gstatic.com/s/firasans/v10/va9B4kDNxMZdWfMOD5VnMK7uQg.woff') format('woff');
        }
      }
    </style>
    <style type="text/css">
      #outlook a {
        padding: 0;
      }
  
      .ReadMsgBody,
      .ExternalClass {
        width: 100%;
      }
  
      .ExternalClass,
      .ExternalClass p,
      .ExternalClass td,
      .ExternalClass div,
      .ExternalClass span,
      .ExternalClass font {
        line-height: 100%;
      }
  
      div[style*="margin: 14px 0"],
      div[style*="margin: 16px 0"] {
        margin: 0 !important;
      }
  
      table,
      td {
        mso-table-lspace: 0;
        mso-table-rspace: 0;
      }
  
      table,
      tr,
      td {
        border-collapse: collapse;
      }
  
      body,
      td,
      th,
      p,
      div,
      li,
      a,
      span {
        -webkit-text-size-adjust: 100%;
        -ms-text-size-adjust: 100%;
        mso-line-height-rule: exactly;
      }
  
      img {
        border: 0;
        outline: none;
        line-height: 100%;
        text-decoration: none;
        -ms-interpolation-mode: bicubic;
      }
  
      a[x-apple-data-detectors] {
        color: inherit !important;
        text-decoration: none !important;
      }
  
      body {
        margin: 0;
        padding: 0;
        width: 100% !important;
        -webkit-font-smoothing: antialiased;
      }
  
      .pc-gmail-fix {
        display: none;
        display: none !important;
      }
  
      @media screen and (min-width: 621px) {
        .pc-email-container {
          width: 620px !important;
        }
      }
    </style>
    <style type="text/css">
      @media screen and (max-width:620px) {
        .pc-sm-p-20 {
          padding: 20px !important
        }
  
        .pc-sm-p-21-10-14 {
          padding: 21px 10px 14px !important
        }
  
        .pc-sm-h-20 {
          height: 20px !important
        }
  
        .pc-sm-mw-100pc {
          max-width: 100% !important
        }
  
        .pc-sm-p-25-10-15 {
          padding: 25px 10px 15px !important
        }
      }
    </style>
    <style type="text/css">
      @media screen and (max-width:525px) {
        .btn-refer {
          height : 45px !important;
        }
        .pc-xs-p-10 {
          padding: 10px !important
        }
  
        .pc-xs-p-5-0 {
          padding: 5px 0 !important
        }
  
        .pc-xs-br-disabled br {
          display: none !important
        }
  
        .pc-xs-w-100pc {
          width: 100% !important
        }
  
        .pc-xs-p-10-0-0 {
          padding: 10px 0 0 !important
        }
  
        .pc-xs-p-15-0-5 {
          padding: 15px 0 5px !important
        }
      }
      .tag-item{
        padding: 2px 3px;
        margin : 2px;
        height : 20px;
      }
    </style>
    <!--[if mso]>
      <style type="text/css">
          .pc-fb-font {
              font-family: Helvetica, Arial, sans-serif !important;
              align-items: center;
          }
      </style>
      <![endif]-->
    <!--[if gte mso 9]><xml><o:OfficeDocumentSettings><o:AllowPNG/><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml><![endif]-->
  </head>
  
  <body
    style="width: 100% !important; margin: 0; padding: 0; mso-line-height-rule: exactly; -webkit-font-smoothing: antialiased; -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; background-color: #f4f4f4"
    class="">
    <div
      style="display: none !important; visibility: hidden; opacity: 0; overflow: hidden; mso-hide: all; height: 0; width: 0; max-height: 0; max-width: 0; font-size: 1px; line-height: 1px; color: #151515;">
      This is preheader text. Some clients will show this text as a preview.</div>
    <div
      style="display: none !important; visibility: hidden; opacity: 0; overflow: hidden; mso-hide: all; height: 0; width: 0; max-height: 0; max-width: 0; font-size: 1px; line-height: 1px;">
      ‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;
    </div>
    <table class="pc-email-body" width="100%" bgcolor="#f4f4f4" border="0" cellpadding="0" cellspacing="0"
      role="presentation" style="table-layout: fixed;">
      <tbody>
        <tr>
          <td class="pc-email-body-inner" align="center" valign="top">
            <!--[if gte mso 9]>
              <v:background xmlns:v="urn:schemas-microsoft-com:vml" fill="t">
                  <v:fill type="tile" src="" color="#f4f4f4"/>
              </v:background>
              <![endif]-->
            <!--[if (gte mso 9)|(IE)]><table width="620" align="center" border="0" cellspacing="0" cellpadding="0" role="presentation"><tr><td width="620" align="center" valign="top"><![endif]-->
            <table class="pc-email-container" width="100%" align="center" border="0" cellpadding="0" cellspacing="0"
              role="presentation" style="margin: 0 auto; max-width: 620px;">
              <tbody>
                <tr>
                  <td align="left" valign="top" style="padding: 0 10px;">
                    <table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation">
                      <tbody>
                        <tr>
                          <td height="20" style="font-size: 1px; line-height: 1px;">&nbsp;</td>
                        </tr>
                      </tbody>
                    </table>
                    <!-- BEGIN MODULE: Menu 1 -->
                    <table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation">
                      <tbody>
                        <tr>
                          <td class="pc-sm-p-20 pc-xs-p-10" bgcolor="#30bcc5" valign="top"
                            style="padding: 25px 30px; background-color: #30bcc5; border-radius: 8px">
                            <table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation">
                              <tbody>
                                <tr>
                                  <td align="center" valign="top">
                                    <table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation">
                                      <tbody>
                                        <tr>
                                        <td align="center" valign="top" style="padding: 10px;">
                                        <a  style="text-decoration: none;font-weight: bold;color: #ffffff;font-size: 16px;">
                                        Hi ${name}, we got new job recommendations for you.
                                        </a>
                                </td>
                                        </tr>
                                      </tbody>
                                    </table>
                                  </td>
                                </tr>
                              </tbody>
                            </table>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                    <!-- END MODULE: Menu 1 -->
                    <!-- BEGIN MODULE: Content 2 -->
                    <table width="100%" border="0" cellspacing="0" cellpadding="0" role="presentation">
                      <tbody>
                        <tr>
                          <td height="8" style="font-size: 1px; line-height: 1px;">&nbsp;</td>
                        </tr>
                      </tbody>
                    </table>
                    <table border="0" cellpadding="0" cellspacing="0" width="100%" role="presentation">
                      <tbody>
                        <tr>
                          <td class="pc-sm-p-25-10-15 pc-xs-p-15-0-5" valign="top" bgcolor="#ffffff"
                            style="padding: 0px 20px 20px; background-color: #ffffff; border-radius: 8px;">
                            <table border="0" cellpadding="0" cellspacing="0" width="100%" role="presentation">
                              <div class="content">
                               ${jobItems}
                              </div>
                            </table>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                    <!-- END MODULE: Content 2 -->
                    <table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation">
                      <tbody>
                        <tr>
                          <td height="20" style="font-size: 1px; line-height: 1px;">&nbsp;</td>
                        </tr>
                      </tbody>
                    </table>
                  </td>
                </tr>
              </tbody>
            </table>
            <!--[if (gte mso 9)|(IE)]></td></tr></table><![endif]-->
          </td>
        </tr>
      </tbody>
    </table>
    <!-- Fix for Gmail on iOS -->
    <div class="pc-gmail-fix" style="white-space: nowrap; font: 15px courier; line-height: 0;">&nbsp; &nbsp; &nbsp; &nbsp;
      &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;
      &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; </div>
  </body>
  </html>`
  );
};

module.exports = {
  templateJob,
};
