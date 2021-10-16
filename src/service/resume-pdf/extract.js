const ResumeParser = require('../resume-pdf');
const util = require('./../../common/util');
const appRoot = require('app-root-path');
const ejs = require('ejs');
const pdf = require('html-pdf');
const { google } = require('googleapis');
let drive = google.drive('v3');
const handleExtractPdf = async (extract, config) => {
    const { url, folderId, nameFile } = extract;
    const result = {};
    try {
        const dataExtractNoBeautiful = await resumeParser(url);
        const dataExtractBeautiful = await handledataAfterExtract(dataExtractNoBeautiful);
        if (dataExtractBeautiful) {
            result.dataParserPdf = dataExtractBeautiful;
        }
        const html = await convertDataExtractToHtml(dataExtractBeautiful);
        const bufferStreamPdf = await convertHtmlToPdf(html, nameFile);
        const jwtClient = new google.auth.JWT(
            config.driverAccount,
            null,
            config.driverToken,
            ['https://www.googleapis.com/auth/drive'],
            null,
        );
        const fileMetadata = {
            name: `refine-${nameFile}.pdf`,
            parents: [folderId],
        };
        const createFileDrive = await drive.files.create({
            auth: jwtClient,
            resource: fileMetadata,
            media: { mimeType: 'application/pdf', body: bufferStreamPdf },
            fields: 'id',
        });
        result.parserPdf = `https://drive.google.com/file/d/${createFileDrive.data.id}`
        return result;
    } catch (error) {
        throw error;
    }
}
async function resumeParser(url) {
    try {
        const pathUrl = `${url}`
        const resumePdf = await ResumeParser.parseResumeFile(
            pathUrl,
            `${pathUrl}compiled`,
        )
        return resumePdf
    } catch (error) {
        throw error
    }
}
function handledataAfterExtract(dataNoBeautiful) {
    try {
        const dataBeautiful = util.convertTextBeautiful(dataNoBeautiful);
        return dataBeautiful;
    } catch (error) {
        throw error
    }
}
async function convertDataExtractToHtml(dataExtract) {
    const ejsData = { ...dataExtract };
    // import font
    ejsData.carlitoRegular = `file:///${appRoot.path}/src/templates/carlito-regular.ttf`;
    ejsData.calibriRegular = `file:///${appRoot.path}/src/templates/calibri_regular.ttf`;
    ejsData.calibriBold = `file:///${appRoot.path}/src/templates/calibri_bold.ttf`;
    ejsData.trebucMsBold = `file:///${appRoot.path}/src/templates/trebucms_bold.ttf`;
    try {
        const ejsHtml = await ejs.renderFile(
            `${appRoot.path}/src/templates/resume-pdf.ejs`,
            ejsData);
        return ejsHtml
    } catch (error) {
        throw error
    }
}
async function convertHtmlToPdf(html) {
    return new Promise((resolve, reject) => {
        let options = {
            format: 'A4',
            header: {
                height: '5mm',
            },
        };
        pdf.create(html, options).toStream((err, stream) => {
            if (stream) {
                resolve(stream)
            } else {
                reject(err)
            }
        });
    })
}


const testHandleExtractPdf = async (url, config) => {
    const result = {};
    const nameFile = "checking-hihihi";
    const folderId = "19Dqt0Xl60Op9I71DjziLVZHfqaYWpE_V"
    const dataExtractNoBeautiful = await resumeParser(url);
    if (dataExtractNoBeautiful) {
        result.dataOld = dataExtractNoBeautiful
    }
    const dataExtractBeautiful = await handledataAfterExtract(dataExtractNoBeautiful);
    if (dataExtractBeautiful) {
        result.dataParserPdf = dataExtractBeautiful;
    }
    const html = await convertDataExtractToHtml(dataExtractBeautiful);
    const bufferStreamPdf = await convertHtmlToPdf(html, nameFile);
    const jwtClient = new google.auth.JWT(
        config.driverAccount,
        null,
        config.driverToken,
        ['https://www.googleapis.com/auth/drive'],
        null,
    );
    const fileMetadata = {
        name: `refine-${nameFile}.pdf`,
        parents: [folderId],
    };
    const createFileDrive = await drive.files.create({
        auth: jwtClient,
        resource: fileMetadata,
        media: { mimeType: 'application/pdf', body: bufferStreamPdf },
        fields: 'id',
    });
    result.parserPdf = `https://drive.google.com/file/d/${createFileDrive.data.id}`
    return result;
}

module.exports = {
    handleExtractPdf,
    testHandleExtractPdf
}