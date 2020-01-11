describe('Daterange Pair', () => {
  let picker1
  let picker2

  before(() => {
    cy.visit('http://localhost:9001')
    cy.window().then(win => {
      picker1 = win.dp('[data-cy="input-1"]', { id: 1 })
      picker2 = win.dp('[data-cy="input-2"]', { id: 1 })
    })
  })

  describe('Daterange instance object properties', () => {
    it('id', () => {
      expect(picker1.id).to.equal(1)
      expect(picker2.id).to.equal(1)
    })

    it('sibling', () => {
      expect(picker1.sibling).to.deep.equal(picker2)
      expect(picker2.sibling).to.deep.equal(picker1)
    })

    it('first', () => {
      expect(picker1.first).to.be.true
      expect(picker2.first).to.be.undefined
    })

    it('second', () => {
      expect(picker2.second).to.be.true
      expect(picker1.second).to.be.undefined
    })
  })

  describe('Daterange UI (& corresponding changes to instance object properties)', () => {
    before(() => cy.get('[data-cy="input-1"]').click())

    describe('Basic visuals and behavior', () => {
      it('should only change months on the calendar being navigated', () => {
        cy.get('[data-cy="section-1"] span.qs-month').then($month => {
          const currentStartMonthName = $month.text()

          cy.get('[data-cy="section-1"] .qs-arrow.qs-right').click().then(() => {
            cy.get('[data-cy="section-1"] span.qs-month').then($month => {
              const nextStartMonthName = $month.text()

              expect(nextStartMonthName).not.to.equal(currentStartMonthName)
              cy.get('[data-cy="section-1"] span.qs-month')
                .should('have.text', nextStartMonthName)
                .should('not.have.text', currentStartMonthName)
              cy.get('[data-cy="section-2"] span.qs-month')
                .should('not.have.text', nextStartMonthName)
                .should('have.text', currentStartMonthName)
            })
          })
        })
      })
    })
  })

  describe.skip('Instance methods', () => {
    const startDayToSelect = 15
    const endDayToSelect = 20

    describe('setDate', () => {
      before(() => {
        expect(picker1.dateSelected).to.be.undefined
        expect(picker2.dateSelected).to.be.undefined

        cy.get('[data-cy="input-1"]').click()

        // Neither calendar should have any date selected.
        cy.get('.qs-active')
          .should('have.length', 0)
      })

      describe('Start instance', () => {
        it('should programmatically set a date on the start calendar', () => {
          picker1.setDate(new Date(picker1.currentYear, picker1.currentMonth, startDayToSelect))

          cy.get('[data-cy="section-1"] .qs-active')
            .should('have.length', 1)
            .should('have.text', `${startDayToSelect}`)

          cy.get('[data-cy="section-2"] .qs-active')
            .should('have.length', 0)
        })

        it('should disable previous dates on the end calendar', () => {
          cy.get('[data-cy="section-2"] .qs-square.qs-disabled')
            .should('have.length', startDayToSelect - 1)

          cy.get('[data-cy="section-1"] .qs-square.qs-disabled')
            .should('have.length', 0)
        })

        it('should populate the start input with that date', () => {
          const expectedInputText = new Date(picker1.currentYear, picker1.currentMonth, startDayToSelect).toDateString()
          cy.get('[data-cy="input-1"]')
            .should('have.value', expectedInputText)
          cy.get('[data-cy="input-2"]')
            .should('have.value', '')
        })

        it('should populate `dateSelected` on the start instance object', () => {
          expect(+picker.dateSelected).to.equal(+new Date(picker.currentYear, picker.currentMonth, startDayToSelect))
        })

        it('should navigate the calendar to that date via the second argument', () => {
          cy.get('.qs-active').click().then(() => {
            const { currentMonthName, currentYear, currentMonth } = picker
            const nextMonthIndex = currentMonth === 0 ? 1 : 0
            const nextMonthName = months[nextMonthIndex]
            const nextYear = currentYear + 1
            const nextDate = 20

            expect(picker.dateSelected).to.be.undefined

            cy.get('.qs-active')
              .should('have.length', 0)
            cy.get('.qs-month')
              .should('have.text', currentMonthName)
            cy.get('.qs-year')
              .should('have.text', `${currentYear}`)
              .then(() => {
                picker.setDate(new Date(nextYear, nextMonthIndex, nextDate), true)

                cy.get('.qs-month')
                  .should('have.text', nextMonthName)
                cy.get('.qs-year')
                  .should('have.text', `${nextYear}`)
                cy.get('[data-cy="input-1"]')
                  .should('have.value', new Date(nextYear, nextMonthIndex, 20).toDateString())
                cy.get('.qs-active')
                  .should('have.text', `${nextDate}`)
              })
          })
        })

        it('should remove the selected date when called with no argument', () => {
          picker.setDate()

          expect(picker.dateSelected).to.be.undefined
          cy.get('.qs-active')
            .should('have.length', 0)

        })
      })

      describe('End instance', () => {})
    })

    describe('setMin', () => {
      before(() => {
        cy.get('.qs-square.qs-disabled')
          .should('have.length', 0)
        cy.get('.qs-active')
          .should('have.length', 0)
        expect(picker.minDate).to.be.undefined
      })

      it('should set the `minDate` property on the instance', () => {
        const minDate = new Date(picker.currentYear, picker.currentMonth, dayToSelect)

        picker.setMin(minDate)
        expect(+picker.minDate).to.equal(+minDate)
      })

      it('should disable dates prior to the provided value (including prev months)', () => {
        cy.get('.qs-square.qs-disabled')
          .should('have.length', dayToSelect - 1)

        cy.get('.qs-arrow.qs-left').click().then(() => {
          const numOfDaysInMonth = new Date(picker.currentYear, picker.currentMonth + 1, 0).getDate()

          cy.get('.qs-square.qs-disabled')
            .should('have.length', numOfDaysInMonth)
        })
      })

      it('should prevent disabled dates from being selected', () => {
        expect(picker.dateSelected).to.be.undefined

        cy.get('.qs-square.qs-disabled')
          .first()
          .should('have.text', '1')
          .click()
          .then(() => {
            expect(picker.dateSelected).to.be.undefined

            cy.get('.qs-active')
              .should('have.length', 0)
          })
      })

      it('should remove the min selectable date when called with no argument', () => {
        picker.setMin()

        expect(picker.minDate).to.be.undefined
        cy.get('.qs-square.qs-disabled')
          .should('have.length', 0)
      })
    })

    describe('setMax', () => {
      before(() => {
        cy.get('.qs-square.qs-disabled')
          .should('have.length', 0)
          .then(() => {
            expect(picker.maxDate).to.be.undefined
            picker.setMax(new Date(picker.currentYear, picker.currentMonth, 1))
          })
      })

      it('should set the `maxDate` property on the instnace', () => {
        expect(+picker.maxDate).to.equal(+new Date(picker.currentYear, picker.currentMonth, 1))
      })

      it('should disabled dates after the provided value (including future months)', () => {
        const numOfDaysInMonth = new Date(picker.currentYear, picker.currentMonth + 1, 0).getDate()
        const numOfDaysNextMonth = new Date(picker.currentYear, picker.currentMonth + 2, 0).getDate()

        cy.get('.qs-square.qs-disabled')
          .should('have.length', numOfDaysInMonth - 1)
        cy.get('.qs-arrow.qs-right').click().then(() => {
          cy.get('.qs-square.qs-disabled')
            .should('have.length', numOfDaysNextMonth)
        })
      })

      it('should prevent disabled dates from being selected', () => {
        expect(picker.dateSelected).to.be.undefined
        cy.get('.qs-square.qs-disabled')
          .first()
          .should('have.text', '1')
          .click()
          .then(() => {
            expect(picker.dateSelected).to.be.undefined
          })
      })

      it('should remove the max selectable date when called with no argument', () => {
        const numOfDaysInMonth = new Date(picker.currentYear, picker.currentMonth + 1, 0).getDate()

        cy.get('.qs-square.qs-disabled')
          .should('have.length', numOfDaysInMonth)
          .then(() => {
            expect(picker.maxDate).not.to.be.undefined
            picker.setMax()
            expect(picker.maxDate).to.be.undefined
            cy.get('.qs-square.qs-disabled')
              .should('have.length', 0)
          })
      })
    })

    describe('show', () => {
      before(() => {
        cy.get('body').click()
        cy.get('.qs-datepicker-container')
          .should('not.be.visible')
      })

      it('should show the calendar when called', () => {
        picker.show()
        cy.get('.qs-datepicker-container')
          .should('be.visible')
      })
    })

    describe('hide', () => {
      it('should hide the calendar when called', () => {
        picker.hide()
        cy.get('.qs-datepicker-container')
          .should('not.be.visible')
      })
    })

    describe('remove', () => {
      before(() => {
        cy.get('.qs-datepicker-container')
          .should('have.length', 1)
      })

      it('should completely nuke the instance object', () => {
        const numOfProps = Object.keys(picker).length

        expect(numOfProps).to.be.gt(0)
        picker.remove()
        expect(Object.keys(picker).length).to.equal(0)
      })

      it('should remove the calendar from the DOM', () => {
        cy.get('.qs-datepicker-container')
          .should('have.length', 0)
      })
    })
  })
})