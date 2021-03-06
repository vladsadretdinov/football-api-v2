import { CompetitionMatches } from './../../services/api.interfaces';
import { ApiService } from './../../services/api.service';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { FormGroup, FormControl } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-competition-calendar-page',
  templateUrl: './competition-calendar-page.component.html',
  styleUrls: ['./competition-calendar-page.component.scss']
})
export class CompetitionCalendarPageComponent implements OnInit {

  competition!: CompetitionMatches;
  subPage: string = "";

  range = new FormGroup({
    start: new FormControl(),
    end: new FormControl(),
  });

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private apiService: ApiService,
    private _snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    const competitionId = this.route.snapshot.paramMap.get('id') || '1';
    const startDate = this.route.snapshot.queryParamMap.get('startDate') || undefined;
    const endDate = this.route.snapshot.queryParamMap.get('endDate') || undefined;

    this.range.setValue({ start: startDate ? new Date(startDate) : null, end: endDate ? new Date(endDate) : null });

    this.apiService.getCompetitionMatches(competitionId, startDate, endDate).subscribe(
      (data: CompetitionMatches) => {
        this.competition = data;
        this.subPage = this.competition.competition.name;
      },
      () => {
        this._snackBar.open("Произошла ошибка", "Закрыть")
      }
    );

    this.range.valueChanges.subscribe((range) => {
      if (range.start && range.end && this.range.valid) {
        const startDate = this.apiService.convertDateToApi(range.start);
        const endDate = this.apiService.convertDateToApi(range.end);
        const queryParams: Params = { startDate, endDate };

        this.router.navigate(
          [],
          {
            relativeTo: this.route,
            queryParams: queryParams,
            queryParamsHandling: 'merge',
          });

        this.apiService.getCompetitionMatches(competitionId, startDate, endDate).subscribe(
          (data) => {
            this.competition = data;
          },
          () => {
            this._snackBar.open("Произошла ошибка", "Закрыть")
          }
        );
      }
    })
  }
}
