import { Injectable, TemplateRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';
import { BsModalService } from 'ngx-bootstrap/modal';

@Injectable()
export class VersionCheckService {
    // this will be replaced by actual hash post-build.js
    private currentHash = '{{POST_BUILD_ENTERS_HASH_HERE}}';    
    modalRef: BsModalRef;

    constructor(private http: HttpClient,
        private modalService: BsModalService) {}

    /**
     * Checks in every set frequency the version of frontend application
     * @param url
     * @param template
     * @param {number} frequency - in milliseconds, defaults to 30 minutes
     */
    public initVersionCheck(url, template: TemplateRef<any>, frequency = 1000 * 60) {
        setInterval(() => {
            this.checkVersion(url, template);
        }, frequency);
    }

    /**
     * Will do the call and check if the hash has changed or not
     * @param url
     */
    private checkVersion(url, template: TemplateRef<any>) {
        //console.log(url);
        // timestamp these requests to invalidate caches
        this.http.get(url + '?t=' + new Date().getTime())
            .first()
            .subscribe(
                (response: any) => {
                    const hash = response.hash;
                    const hashChanged = this.hasHashChanged(this.currentHash, hash);
                    console.log(hash);
                    console.log(hashChanged);
                    // If new version, do something
                    if (hashChanged) {
                        console.log(hashChanged);
                        // ENTER YOUR CODE TO DO SOMETHING UPON VERSION CHANGE
                        // for an example: location.reload();
                        //alert('A New Version is Available.Click on the button to update to the latest version of WreckerTow');
                        //location.reload();
                        this.modalRef = this.modalService.show(template, { class: 'modal-sm' });
                    }
                    // store the new hash so we wouldn't trigger versionChange again
                    // only necessary in case you did not force refresh
                    this.currentHash = hash;
                },
                (err) => {
                    console.error(err, 'Could not get version');
                }
            );
    }

    /**
     * Checks if hash has changed.
     * This file has the JS hash, if it is a different one than in the version.json
     * we are dealing with version change
     * @param currentHash
     * @param newHash
     * @returns {boolean}
     */
    private hasHashChanged(currentHash, newHash) {
        if (!currentHash || currentHash === '{{POST_BUILD_ENTERS_HASH_HERE}}') {
            return false;
        }

        return currentHash !== newHash;
    }
}

