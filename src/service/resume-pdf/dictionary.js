let request = require('request');
let cheerio = require('cheerio');
let _ = require('underscore');

module.exports = {
  titles: {
    objective: ['objective', 'mục tiêu', 'career objective', 'CAREER OBJECTIVE', 'objectives', 'mục tiêu nghề nghiệp', 'Mục Tiêu Nghề Nghiệp'],
    summary: ['summary', 'About', 'abstract', 'profile', 'brief', 'About Me', 'overview', 'objective', 'Personal Profile', 'objectives', 'WHO AM I', 'Career Objective', 'PROFESSIONAL SUMMARY', 'PROFESSIONAL PROFILE', 'Bio', 'Seeking position as a', 'Seeking position as an', 'PROFESSIONAL BIO', 'Personal summary', 'Personal bio', 'Career summary', 'Professional History', 'Background', 'Общие сведения', 'биография', 'Цель', 'Personal statement', 'профессиональная биография', 'Обо мне', 'сводка', 'общая сводка', 'Сведения о себе', 'сведения', 'Qısa məlumat', 'Краткая информация', 'Краткая', 'Haqqımda', 'Ümumi məlumat', 'Məqsədim', 'Profili', 'Profil', 'Профиль', 'Haqqında', 'Peşakar profili', 'Peşakar profil', 'Xülasə', 'Məzmun', 'Karyera hədəfim', 'Karyera hədəfi', 'Hədəfi', 'Hədəfləri', 'Ümumi məlumat', 'Şəxsi Xülasə', 'Peşəkarlıqla bağlı Xülasə', 'Xüsusi Qabiliyyətlə bağlı Xülasə', 'Qısa məzmun', 'Профессиональная деятельность', 'достижение', 'сфера деятельности', 'Успехи и достижения', 'Məqsəd', 'Məqsədi', 'Introduction'],
    technology: ['technology', 'technologies'],
    experience: ['experience', 'kinh nghiệm làm việc', 'ACHIEVEMENTS', 'experience', 'career progression', 'work', 'career', 'employment record', 'employment history', 'work experience', 'Employment Experience', 'professional experience', 'Work History', 'Relevant Work Experience', 'Professional bio', 'Professional biography', 'teaching experience', 'Relevant Experience', 'Selected Experience', 'ПРОФЕССИОНАЛЬНЫЕ ДАННЫЕ', 'Professional Background', 'Профессиональный опыт', 'İş Təcrübəsi', 'Опыт работы', 'Kariyera Tarixi', 'Karyera Tarixi', 'Peşəkar təcrübə', 'Peşəkar iş təcrübəsi', 'Peşəkar təcrübəm', 'Peşəkar təcrübəsi', 'İŞ TƏCRÜBƏSİ / WORK EXPERIENCE', 'Ərizəçinin iş təcrübəsi haqqında məlumatları', 'Ərizəçinin iş təcrübəsi haqqında məlumatlar', 'İş təcrübəm', 'Peşəkar iş təcrübəm', 'Опыт работы', 'РАБОЧИЙ ОПЫТ', 'Трудовая и иная деятельность', 'Трудовая деятельность', 'EMPLOYMENT', 'Career Highlights', 'Experience highlights', 'EDUCATION AND TRAINING', 'Təhsil və təlim kursları', 'Təhsil və təlim', 'Təlim və təhsil', 'Military experience'],
    education: ['E D U C A T I O N', 'education', 'education and training', 'education & training', 'higher education', 'Educational qualifications', 'Education highlights', 'ACADEMIC QUALIFICATIONS', 'QUALIFIED UNIVERSITY', 'QUALIFIED UNIVERSITIES', 'ACADEMIC BACKGROUND', 'ACADEMIC DETAILS', 'ACADEMIC  RECORD', 'Education and Qualifications', 'Education & Qualifications', 'Образование', 'TƏHSİL', 'Ərizəçinin təhsili haqqında məlumatları', 'Ərizəçinin təhsili haqqında məlumatlar', 'Təhsili', 'Təhsil haqqında məlumatlar', 'AKADEMİK NAİLİYYƏTLƏR', 'Основное образование', 'Education, Honors, and Certifications', 'Ali təhsil', 'Ali təhsili', 'secondary education', 'Дополнительное образование', 'Auxiliary Education', 'academic background', 'education and training', 'study', 'học vấn', 'Education and Achievements', 'Học Vấn'],
    skills: ['skills', 'technical skills & languages', 'Skills & Expertise', 'AREAS OF EXPERTISE', 'skills summary', 'expertise’, ‘technologies', 'KEY SKILLS AND COMPETENCIES', 'Skills & Competencies', 'Skills and Competencies', 'Skills/Competencies', 'competencies', 'competency', 'qualifications', 'strengths', 'strength', 'Key Skills', 'Primary Skills', 'professional skills', 'professional', 'related skills', 'language and computer skills', 'summary of qualifications', 'summary of skills', 'Qualifications summary', 'SKILLS AND ABILITIES', 'special skills', 'SPECIAL SKILLS AND ABILITIES', 'Core Competencies/Skills', 'Core Skills', 'Core Competencies', 'Core Competencies and Skills', 'Core Competencies & Skills', 'KEY SKILLS & COMPETENCIES', 'KEY SKILLS/COMPETENCIES', 'HARD & SOFT SKILLS', 'HARD AND SOFT SKILLS', 'Core Competencies/Areas of Expertise', 'Профессиональные навыки', 'Знания и опыт', 'Şəxsi bacarıq və qabilliyətlər', 'Əsas Keyfiyyət və Bacarıqlar', 'Relevant skills', 'MÜTƏXƏSSİS OLDUĞU SAHƏLƏR', 'Experience & Skills', 'Знания и опыт', 'Ключевые знания и навыки', 'Навыки и умения', 'Навыки', 'specialties', 'specialties, capabilities', 'specialties & capabilities', 'specialties and capabilities', 'specialties/capabilities', 'Ключевые навыки', 'Bacarıqlar', 'ТРУДОВЫЕ НАВЫКИ', 'Трудовые навыки и умения', 'Əsas bacarıqlar', 'Əsas bilik və bacarıqlar', 'lists of skills', 'Skills/Training', 'Digital skills', 'tech skills', 'technical skills', 'technical', 'personal skills', 'personality skills', 'soft skills', 'soft', 'technology', 'computer', 'computer skills', 'software skills', 'software', 'additional skills', 'Kompüter bacarıq və qabiliyyəti', 'KOMPÜTER BİLİYİ', 'Kamputer bilgisi', 'Kompyuter biliyi', 'Kompyuter bilikləri', 'Kompüter bilikləri', 'Texniki biliklər', 'Texniki bilikləri', 'KOMPYUTER BACARIQLARI', 'KOMPÜTER BACARIQLARI', 'KOMPÜTER BİLİYİ / IT SKILLS', 'IT Skills', 'Komputer proqramları', 'Komputer bilikləri', 'Komputer bilgisi', 'Komputer bacarıqları', 'Relevant IT skills', 'Relevant Software skills', 'ЛИЧНЫЕ КАЧЕСТВА', 'Vocational Experience', 'Компьютерные навыки', 'Личные характеристики и прочее', 'Личные характеристики', 'Знание компьютера', 'Interpersonal and Teamwork Skills', 'Quantitative Skills', 'Владение компьютером', 'Технические навыки', 'Личные качества', 'Специальные навыки', 'ДОПОЛНИТЕЛЬНЫЕ ТРУДОВЫЕ НАВЫКИ', 'Programming skills', 'Coding skills', 'Other skills', 'skills', 'technical skills', 'my skill', 'soft skills', 'soft skill', 'related skills', 'technology skills', 'Skillss', 'skill', 'KỸ NĂNG', 'professional skills'],
    language: ['language', 'languages', 'LANGUAGES'],
    courses: ['courses', 'Chứng Chỉ'],
    projects: ['projects', 'dự án', 'projects history', 'projects', 'portfolio', 'my portfolio', 'RESEARCH INTERESTS', 'RESEARCHES', 'portfolio', 'Projects implemented', 'Implemented projects', 'Ongoing projects', 'Projects authored', 'Authored projects', 'Programs', 'Projects & Programs'],
    links: ['links'],
    contacts: ['contacts', 'contact'],
    positions: ['positions', 'position'],
    profiles: [
      'profiles',
      'social connect',
      'social-profiles',
      'social profiles',
    ],
    awards: ['awards'],
    honors: ['honors'],
    additional: ['additional'],
    certification: ['certification', 'certifications'],
    interests: ['interests'],
  },
  profiles: [
    [
      'github.com',
      function (url, Resume, profilesWatcher) {
        download(url, (data, err) => {
          if (data) {
            let $ = cheerio.load(data);
            let fullName = $('.vcard-fullname').text();
            let location = $('.octicon-location')
              .parent()
              .text();
            let mail = $('.octicon-mail')
              .parent()
              .text();
            let link = $('.octicon-link')
              .parent()
              .text();
            let clock = $('.octicon-clock')
              .parent()
              .text();
            let company = $('.octicon-organization')
              .parent()
              .text();

            Resume.addObject('github', {
              name: fullName,
              location,
              email: mail,
              link,
              joined: clock,
              company,
            });
          } else {
            return console.log(err);
          }
          // profilesInProgress--;
          profilesWatcher.inProgress--;
        });
      },
    ],
    [
      'linkedin.com',
      function (url, Resume, profilesWatcher) {
        download(url, (data, err) => {
          if (data) {
            let $ = cheerio.load(data);
            let linkedData = {
              positions: {
                past: [],
                current: {},
              },
              languages: [],
              skills: [],
              educations: [],
              volunteering: [],
              volunteeringOpportunities: [],
            };
            let $pastPositions = $('.past-position');
            let $currentPosition = $('.current-position');
            let $languages = $('#languages-view .section-item > h4 > span');
            let $skills = $(
              '.skills-section .skill-pill .endorse-item-name-text',
            );
            let $educations = $('.education');
            let $volunteeringListing = $('ul.volunteering-listing > li');
            let $volunteeringOpportunities = $(
              'ul.volunteering-opportunities > li',
            );

            linkedData.summary = $('#summary-item .summary').text();
            linkedData.name = $('.full-name').text();
            // current position
            linkedData.positions.current = {
              title: $currentPosition.find('header > h4').text(),
              company: $currentPosition.find('header > h5').text(),
              description: $currentPosition.find('p.description').text(),
              period: $currentPosition.find('.experience-date-locale').text(),
            };
            // past positions
            _.forEach($pastPositions, (pastPosition) => {
              let $pastPosition = $(pastPosition);
              linkedData.positions.past.push({
                title: $pastPosition.find('header > h4').text(),
                company: $pastPosition.find('header > h5').text(),
                description: $pastPosition.find('p.description').text(),
                period: $pastPosition.find('.experience-date-locale').text(),
              });
            });
            _.forEach($languages, (language) => {
              linkedData.languages.push($(language).text());
            });
            _.forEach($skills, (skill) => {
              linkedData.skills.push($(skill).text());
            });
            _.forEach($educations, (education) => {
              let $education = $(education);
              linkedData.educations.push({
                title: $education.find('header > h4').text(),
                major: $education.find('header > h5').text(),
                date: $education.find('.education-date').text(),
              });
            });
            _.forEach($volunteeringListing, (volunteering) => {
              linkedData.volunteering.push($(volunteering).text());
            });
            _.forEach($volunteeringOpportunities, (volunteering) => {
              linkedData.volunteeringOpportunities.push($(volunteering).text());
            });

            Resume.addObject('linkedin', linkedData);
          } else {
            return console.log(err);
          }
          profilesWatcher.inProgress--;
        });
      },
    ],
    'facebook.com',
    'bitbucket.org',
    'stackoverflow.com',
  ],
  inline: {
    // address: 'address',
    skype: 'skype',
  },
  regular: {
    name: [/([A-Z][a-z]*)(\s[A-Z][a-z]*)/],
    email: [/([a-z0-9_\.-]+)@([\da-z\.-]+)\.([a-z\.]{2,6})/],
    phone: [/((?:\+?\d{1,3}[\s-])?\(?\d{2,3}\)?[\s.-]?\d{3}[\s.-]\d{4,5})/],
  },
};

// helper method
function download(url, callback) {
  request(url, (error, response, body) => {
    if (!error && response.statusCode == 200) {
      callback(body);
    } else {
      callback(null, error);
    }
  });
}
